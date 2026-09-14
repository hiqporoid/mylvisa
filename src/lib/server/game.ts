import "server-only";
import { z } from "zod";
import { FIRST_QUIZ_DATE, MAX_ANSWER_LENGTH, PREVIEW_SECONDS, ROUND_SECONDS } from "@/lib/quiz/catalog";
import { addDays, helsinkiDate, nextMidnight } from "@/lib/quiz/date";
import { dateSchema } from "@/lib/quiz/schema";
import { evaluateAnswer, totalScore } from "@/lib/quiz/score";
import type { AnswerResult, LocalRoundOutcome, QuizResponse, Resolution } from "@/lib/quiz/contracts";
import { getDailyQuiz } from "./bank";
import { canonicalEntityId, createConfirmationToken, readConfirmationToken, resolveAnswer } from "./answer-resolution";

const attemptSchema = z.discriminatedUnion("action", [
  z.strictObject({ action: z.literal("answer"), answer: z.string().trim().min(1).max(MAX_ANSWER_LENGTH) }),
  z.strictObject({ action: z.literal("confirm"), confirmationToken: z.string().min(1).max(1024) }),
  z.strictObject({ action: z.literal("timeout") }),
  z.strictObject({ action: z.literal("skip") }),
]);

const requestSchema = z.strictObject({
  date: dateSchema,
  mode: z.enum(["daily", "practice"]),
  answers: z.array(z.string().max(MAX_ANSWER_LENGTH)).max(30),
  outcomes: z.array(z.enum(["answer", "timeout", "skipped"])).max(30).optional(),
  attempt: attemptSchema.optional(),
  releaseId: z.string().max(80).optional(),
  roundStartedAt: z.string().datetime().optional(),
}).superRefine((request, context) => {
  if (request.outcomes && request.outcomes.length !== request.answers.length)
    context.addIssue({ code: "custom", message: "Each stored answer needs one outcome." });
  if (request.attempt && !request.roundStartedAt)
    context.addIssue({ code: "custom", message: "An active attempt needs its original round clock." });
});

export class GameError extends Error {
  constructor(public code: string, public status: number, message: string) {
    super(message);
  }
}

function missedResult(question: ReturnType<typeof getDailyQuiz>["questions"][number], outcome: "timeout" | "skipped", scored = true): AnswerResult {
  return {
    id: question.id,
    prompt: question.prompt,
    category: question.category,
    answer: "",
    accepted: false,
    outcome,
    points: 0,
    maxPoints: scored ? Math.max(...question.answers.map((answer) => answer.points)) : 0,
    rarityRank: 0,
    explanation: "",
  };
}

/** Stateless practice/local fallback using the same resolver contract as Daily. */
export function play(input: unknown, now = new Date()): QuizResponse {
  const parsed = requestSchema.safeParse(input);
  if (!parsed.success)
    throw new GameError("INVALID_REQUEST", 400, "Vastauksen tiedot eivät kelpaa. Päivitä sivu ja yritä uudelleen.");
  const { date, mode, answers, releaseId, roundStartedAt, attempt } = parsed.data;
  const outcomes: LocalRoundOutcome[] = parsed.data.outcomes ?? answers.map(() => "answer" as const);
  const today = helsinkiDate(now);
  if (mode === "daily" && date !== today)
    throw new GameError("DAY_CHANGED", 409, "Päivä vaihtui. Uusi päivän visa odottaa sinua.");
  if (date < FIRST_QUIZ_DATE || (mode === "practice" && (date >= today || date < addDays(today, -30))))
    throw new GameError("UNAVAILABLE", 400, "Harjoiteltavissa ovat edellisten 30 päivän visat.");

  const quiz = getDailyQuiz(date);
  if (releaseId && quiz.releaseId !== releaseId)
    throw new GameError("RELEASE_CHANGED", 409, "Visa on päivittynyt. Lataa sivu uudelleen.");
  if (answers.length > quiz.questions.length)
    throw new GameError("INVALID_REQUEST", 400, "Vastauksia on liikaa.");

  const results: AnswerResult[] = answers.map((answer, index) => {
    const outcome = outcomes[index];
    if (outcome === "timeout" || outcome === "skipped") return missedResult(quiz.questions[index], outcome, mode === "daily");
    const evaluated = evaluateAnswer(quiz.questions[index], answer, mode === "daily");
    return { ...evaluated, originalAnswer: answer, canonicalized: evaluated.accepted && evaluated.canonicalAnswer !== answer };
  });
  let resolution: Resolution | undefined;
  const current = quiz.questions[results.length];

  if (attempt && current && roundStartedAt) {
    const startedAt = Date.parse(roundStartedAt);
    if (!Number.isFinite(startedAt) || startedAt > now.getTime() + 5_000)
      throw new GameError("INVALID_REQUEST", 400, "Kierroksen kellonaika ei kelpaa.");
    const deadline = startedAt + (PREVIEW_SECONDS + ROUND_SECONDS) * 1000;
    const runId = `local:${date}:${quiz.releaseId}`;
    if (attempt.action === "timeout") {
      if (now.getTime() < deadline) throw new GameError("ROUND_ACTIVE", 409, "Kierroksella on vielä aikaa.");
      results.push(missedResult(current, "timeout", mode === "daily"));
      resolution = { status: "timeout" };
    } else {
      if (now.getTime() < startedAt + PREVIEW_SECONDS * 1000)
        throw new GameError("PREVIEW", 409, "Lue kysymys ensin.");
      if (now.getTime() >= deadline) {
        results.push(missedResult(current, "timeout", mode === "daily"));
        resolution = { status: "timeout" };
      } else if (attempt.action === "skip") {
        results.push(missedResult(current, "skipped", mode === "daily"));
        resolution = { status: "skipped" };
      } else if (attempt.action === "answer") {
        const resolved = resolveAnswer(current, attempt.answer);
        if (resolved.status === "invalid") {
          resolution = { status: "invalid", message: "Ei osumaa, kokeile uudelleen." };
        } else if (resolved.status === "accepted") {
          const evaluated = evaluateAnswer(current, resolved.answer.canonical, mode === "daily");
          results.push({ ...evaluated, answer: attempt.answer, originalAnswer: attempt.answer, canonicalized: resolved.answer.canonical !== attempt.answer });
          resolution = { status: "accepted", canonicalAnswer: resolved.answer.canonical };
        } else {
          const confirmationToken = createConfirmationToken({
            version: 1,
            runId,
            userId: "local",
            questionId: current.id,
            runVersion: results.length,
            normalizedInput: resolved.normalizedInput,
            originalInput: resolved.originalInput,
            canonicalEntityId: canonicalEntityId(current, resolved.answer.canonical),
            expiresAt: deadline,
          });
          resolution = { status: "confirm", canonicalAnswer: resolved.answer.canonical, confirmationToken };
        }
      } else {
        const payload = readConfirmationToken(attempt.confirmationToken);
        if (!payload || payload.runId !== runId || payload.userId !== "local" || payload.questionId !== current.id || payload.runVersion !== results.length || payload.expiresAt !== deadline || payload.expiresAt <= now.getTime())
          throw new GameError("INVALID_CONFIRMATION", 409, "Vahvistus ei ole enää voimassa. Lähetä vastaus uudelleen.");
        const canonical = current.answers.find((answer) => canonicalEntityId(current, answer.canonical) === payload.canonicalEntityId);
        if (!canonical) throw new GameError("INVALID_CONFIRMATION", 409, "Vahvistus ei kuulu tähän kysymykseen.");
        const evaluated = evaluateAnswer(current, canonical.canonical, mode === "daily");
        results.push({ ...evaluated, answer: payload.originalInput, originalAnswer: payload.originalInput, canonicalized: true });
        resolution = { status: "accepted", canonicalAnswer: canonical.canonical };
      }
    }
  }

  const nextQuestion = quiz.questions[results.length];
  return {
    date,
    today,
    mode,
    releaseId: quiz.releaseId,
    length: quiz.questions.length,
    serverNow: now.toISOString(),
    nextRollover: nextMidnight(now).toISOString(),
    results,
    current: nextQuestion
      ? { id: nextQuestion.id, prompt: nextQuestion.prompt, category: nextQuestion.category, number: results.length + 1, universeId: nextQuestion.universeId }
      : null,
    summary: nextQuestion ? null : totalScore(results),
    ...(resolution ? { resolution } : {}),
  };
}
