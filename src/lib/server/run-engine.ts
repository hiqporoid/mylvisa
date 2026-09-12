import "server-only";
import { createHash } from "node:crypto";
import { z } from "zod";
import { PREVIEW_SECONDS, ROUND_SECONDS, MAX_ANSWER_LENGTH } from "@/lib/quiz/catalog";
import { helsinkiDate, nextMidnight } from "@/lib/quiz/date";
import { evaluateAnswer, matchAnswer, totalScore } from "@/lib/quiz/score";
import type { Question } from "@/lib/quiz/schema";
import type { AnswerResult, QuizResponse } from "@/lib/quiz/contracts";
import { GameError } from "./game";

export const runCommand = z.discriminatedUnion("action", [
  z.strictObject({ action: z.literal("start") }),
  z.strictObject({ action: z.literal("next"), version: z.number().int().nonnegative() }),
  z.strictObject({ action: z.literal("answer"), version: z.number().int().nonnegative(), questionId: z.string().max(120), answer: z.string().max(MAX_ANSWER_LENGTH) }),
]);
export type RunCommand = z.infer<typeof runCommand>;
export type StoredRound = { question_id: string; canonical_entity_id: string | null; points: number; submitted_at: string; outcome: "accepted" | "wrong" | "timeout" | "blank" };
export type Run = {
  id: string; user_id: string; quiz_date: string; release_id: string; bank_hash: string;
  question_ids: string[]; started_at: string; completed_at: string | null;
  round_started_at: string | null; current_round: number; total_score: number; accepted_count: number;
  status: "answering" | "feedback" | "completed"; version: number; rounds: StoredRound[];
};
export function bankHash(questions: Question[]) { return createHash("sha256").update(JSON.stringify(questions)).digest("hex"); }
export function entityId(question: Question, canonical: string) {
  // Stable content-addressed ID, independent of release, position and nickname.
  return createHash("sha256").update(`${question.baseUniverseId ?? question.universeId}\0${canonical.normalize("NFC")}`).digest("hex");
}
export function transition(run: Run, command: Exclude<RunCommand, { action: "start" }>, questions: Question[], now: Date): Run {
  if (run.quiz_date !== helsinkiDate(now)) throw new GameError("DAY_CHANGED", 409, "Päivä vaihtui. Palaa päivän visaan.");
  if (run.bank_hash !== bankHash(questions)) throw new GameError("RELEASE_CHANGED", 409, "Tämän pelin sisältö on muuttunut. Tulosta ei voi julkaista.");
  if (run.version !== command.version || run.status === "completed") return run;
  const next = structuredClone(run);
  if (command.action === "next") {
    if (run.status !== "feedback") return run;
    next.status = "answering";
    next.round_started_at = now.toISOString();
  } else {
    if (run.status !== "answering" || !run.round_started_at || command.questionId !== run.question_ids[run.current_round]) return run;
    const start = Date.parse(run.round_started_at);
    if (now.getTime() < start + PREVIEW_SECONDS * 1000) throw new GameError("PREVIEW", 409, "Lue kysymys ensin.");
    const timeout = now.getTime() >= start + (PREVIEW_SECONDS + ROUND_SECONDS) * 1000;
    const question = questions[run.current_round];
    const match = timeout ? undefined : matchAnswer(question, command.answer);
    const evaluated = evaluateAnswer(question, timeout ? "" : command.answer);
    next.rounds.push({ question_id: question.id, canonical_entity_id: match ? entityId(question, match.canonical) : null, points: evaluated.points, submitted_at: now.toISOString(), outcome: timeout ? "timeout" : match ? "accepted" : command.answer.trim() ? "wrong" : "blank" });
    next.current_round++;
    next.total_score += evaluated.points;
    next.accepted_count += Number(evaluated.accepted);
    next.round_started_at = null;
    next.status = next.current_round === questions.length ? "completed" : "feedback";
    if (next.status === "completed") next.completed_at = now.toISOString();
  }
  next.version++;
  return next;
}
export function runResponse(run: Run, questions: Question[], now: Date): QuizResponse {
  const results: AnswerResult[] = run.rounds.map((round, index) => {
    const question = questions[index];
    const canonical = question.answers.find(answer => entityId(question, answer.canonical) === round.canonical_entity_id);
    const result = evaluateAnswer(question, canonical?.canonical ?? "");
    return { ...result, answer: round.outcome === "wrong" ? "—" : canonical?.canonical ?? "", points: round.points };
  });
  const current = run.status === "answering" ? questions[run.current_round] : null;
  return {
    date: run.quiz_date, today: helsinkiDate(now), mode: "daily", releaseId: run.release_id,
    length: questions.length, serverNow: now.toISOString(), nextRollover: nextMidnight(now).toISOString(),
    results, current: current ? { id: current.id, prompt: current.prompt, category: current.category, number: run.current_round + 1, universeId: current.universeId } : null,
    summary: run.status === "completed" ? totalScore(results) : null,
    persistence: "saved", runVersion: run.version, runStatus: run.status, roundStartedAt: run.round_started_at,
  };
}
