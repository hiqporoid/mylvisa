import "server-only";
import { createHash } from "node:crypto";
import { z } from "zod";
import { PREVIEW_SECONDS, ROUND_SECONDS, MAX_ANSWER_LENGTH } from "@/lib/quiz/catalog";
import { helsinkiDate, nextMidnight } from "@/lib/quiz/date";
import { normalizeAnswer } from "@/lib/quiz/normalize";
import { evaluateAnswer, totalScore } from "@/lib/quiz/score";
import type { Question } from "@/lib/quiz/schema";
import type { AnswerResult, QuizResponse, Resolution } from "@/lib/quiz/contracts";
import { canonicalEntityId, createConfirmationToken, readConfirmationToken, resolveAnswer } from "./answer-resolution";
import { GameError } from "./game";

export const runCommand = z.discriminatedUnion("action", [
  z.strictObject({ action: z.literal("start") }),
  z.strictObject({ action: z.literal("next"), version: z.number().int().nonnegative() }),
  z.strictObject({ action: z.literal("answer"), version: z.number().int().nonnegative(), questionId: z.string().max(120), answer: z.string().trim().min(1).max(MAX_ANSWER_LENGTH) }),
  z.strictObject({ action: z.literal("confirm"), version: z.number().int().nonnegative(), questionId: z.string().max(120), confirmationToken: z.string().min(1).max(1024) }),
  z.strictObject({ action: z.literal("timeout"), version: z.number().int().nonnegative(), questionId: z.string().max(120) }),
  z.strictObject({ action: z.literal("skip"), version: z.number().int().nonnegative(), questionId: z.string().max(120) }),
]);
export type RunCommand = z.infer<typeof runCommand>;
export type StoredRound = {
  question_id: string;
  canonical_entity_id: string | null;
  original_input?: string;
  points: number;
  submitted_at: string;
  outcome: "accepted" | "timeout" | "skipped" | "wrong" | "blank";
};
export type Run = {
  id: string; user_id: string; quiz_date: string; release_id: string; bank_hash: string;
  question_ids: string[]; started_at: string; completed_at: string | null;
  round_started_at: string | null; current_round: number; total_score: number; accepted_count: number;
  status: "answering" | "feedback" | "completed"; version: number; rounds: StoredRound[];
};
export function bankHash(questions: Question[]) {
  const stable = questions.map((question) => ({
    ...question,
    answers: question.answers.map(({ intentAliases, ...answer }) => intentAliases.length ? { ...answer, intentAliases } : answer),
  }));
  return createHash("sha256").update(JSON.stringify(stable)).digest("hex");
}
export function entityId(question: Question, canonical: string) {
  return canonicalEntityId(question, canonical);
}
function deadline(run: Run) {
  return Date.parse(run.round_started_at!) + (PREVIEW_SECONDS + ROUND_SECONDS) * 1000;
}

function finishRound(run: Run, question: Question, now: Date, outcome: "accepted" | "timeout" | "skipped", canonical?: Question["answers"][number], originalInput?: string) {
  const next = structuredClone(run);
  const points = canonical?.points ?? 0;
  next.rounds.push({
    question_id: question.id,
    canonical_entity_id: canonical ? entityId(question, canonical.canonical) : null,
    ...(canonical && originalInput ? { original_input: originalInput.trim() } : {}),
    points,
    submitted_at: now.toISOString(),
    outcome,
  });
  next.current_round++;
  next.total_score += points;
  next.accepted_count += Number(Boolean(canonical));
  next.round_started_at = null;
  next.status = next.current_round === questionsLength(run) ? "completed" : "feedback";
  if (next.status === "completed") next.completed_at = now.toISOString();
  next.version++;
  return next;
}

function questionsLength(run: Run) {
  return run.question_ids.length;
}

export type RunTransition = { run: Run; resolution?: Resolution };

export function resolveRunCommand(
  run: Run,
  command: Exclude<RunCommand, { action: "start" }>,
  questions: Question[],
  now: Date,
  secret?: string,
): RunTransition {
  if (run.quiz_date !== helsinkiDate(now)) throw new GameError("DAY_CHANGED", 409, "Päivä vaihtui. Palaa päivän visaan.");
  if (run.bank_hash !== bankHash(questions)) throw new GameError("RELEASE_CHANGED", 409, "Tämän pelin sisältö on muuttunut. Tulosta ei voi julkaista.");
  if (run.version !== command.version || run.status === "completed") return { run };
  if (command.action === "next") {
    if (run.status !== "feedback") return { run };
    const next = structuredClone(run);
    next.status = "answering";
    next.round_started_at = now.toISOString();
    next.version++;
    return { run: next };
  }

  if (run.status !== "answering" || !run.round_started_at || command.questionId !== run.question_ids[run.current_round]) return { run };
  const start = Date.parse(run.round_started_at);
  const question = questions[run.current_round];
  if (!question) return { run };
  const expiresAt = deadline(run);

  if (command.action === "timeout") {
    if (now.getTime() < expiresAt) throw new GameError("ROUND_ACTIVE", 409, "Kierroksella on vielä aikaa.");
    return { run: finishRound(run, question, now, "timeout"), resolution: { status: "timeout" } };
  }
  if (now.getTime() < start + PREVIEW_SECONDS * 1000) throw new GameError("PREVIEW", 409, "Lue kysymys ensin.");
  if (now.getTime() >= expiresAt)
    return { run: finishRound(run, question, now, "timeout"), resolution: { status: "timeout" } };

  if (command.action === "skip")
    return { run: finishRound(run, question, now, "skipped"), resolution: { status: "skipped" } };

  if (command.action === "answer") {
    const resolved = resolveAnswer(question, command.answer);
    if (resolved.status === "invalid")
      return { run, resolution: { status: "invalid", message: "Ei osumaa, kokeile uudelleen." } };
    if (resolved.status === "accepted") {
      return {
        run: finishRound(run, question, now, "accepted", resolved.answer, command.answer),
        resolution: { status: "accepted", canonicalAnswer: resolved.answer.canonical },
      };
    }
    const confirmationToken = createConfirmationToken({
      version: 1,
      runId: run.id,
      userId: run.user_id,
      questionId: question.id,
      runVersion: run.version,
      normalizedInput: resolved.normalizedInput,
      originalInput: resolved.originalInput,
      canonicalEntityId: entityId(question, resolved.answer.canonical),
      expiresAt,
    }, secret);
    return { run, resolution: { status: "confirm", canonicalAnswer: resolved.answer.canonical, confirmationToken } };
  }

  const payload = readConfirmationToken(command.confirmationToken, secret);
  if (!payload || payload.runId !== run.id || payload.userId !== run.user_id || payload.questionId !== question.id || payload.runVersion !== run.version || payload.expiresAt !== expiresAt || payload.expiresAt <= now.getTime())
    throw new GameError("INVALID_CONFIRMATION", 409, "Vahvistus ei ole enää voimassa. Lähetä vastaus uudelleen.");
  const canonical = question.answers.find((answer) => entityId(question, answer.canonical) === payload.canonicalEntityId);
  if (!canonical) throw new GameError("INVALID_CONFIRMATION", 409, "Vahvistus ei kuulu tähän kysymykseen.");
  return {
    run: finishRound(run, question, now, "accepted", canonical, payload.originalInput),
    resolution: { status: "accepted", canonicalAnswer: canonical.canonical },
  };
}

export function transition(run: Run, command: Exclude<RunCommand, { action: "start" }>, questions: Question[], now: Date): Run {
  return resolveRunCommand(run, command, questions, now).run;
}
export function runResponse(run: Run, questions: Question[], now: Date, resolution?: Resolution): QuizResponse {
  const results: AnswerResult[] = run.rounds.map((round, index) => {
    const question = questions[index];
    const canonical = question.answers.find(answer => entityId(question, answer.canonical) === round.canonical_entity_id);
    if (!canonical) {
      const outcome = round.outcome === "timeout" ? "timeout" : round.outcome === "skipped" ? "skipped" : "legacy-invalid";
      return {
        id: question.id, prompt: question.prompt, category: question.category, answer: "", accepted: false,
        outcome, points: 0, maxPoints: Math.max(...question.answers.map((answer) => answer.points)), rarityRank: 0, explanation: "",
      };
    }
    const result = evaluateAnswer(question, canonical.canonical);
    const originalAnswer = round.original_input ?? canonical.canonical;
    return {
      ...result,
      answer: originalAnswer,
      originalAnswer,
      canonicalAnswer: canonical.canonical,
      canonicalized: normalizeAnswer(originalAnswer) !== normalizeAnswer(canonical.canonical),
      outcome: "accepted",
      points: round.points,
    };
  });
  const current = run.status === "answering" ? questions[run.current_round] : null;
  return {
    date: run.quiz_date, today: helsinkiDate(now), mode: "daily", releaseId: run.release_id,
    length: questions.length, serverNow: now.toISOString(), nextRollover: nextMidnight(now).toISOString(),
    results, current: current ? { id: current.id, prompt: current.prompt, category: current.category, number: run.current_round + 1, universeId: current.universeId } : null,
    summary: run.status === "completed" ? totalScore(results) : null,
    persistence: "saved", runVersion: run.version, runStatus: run.status, roundStartedAt: run.round_started_at,
    ...(resolution ? { resolution } : {}),
  };
}
