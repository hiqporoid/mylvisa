import "server-only";
import { z } from "zod";
import { FIRST_QUIZ_DATE, MAX_ANSWER_LENGTH } from "@/lib/quiz/catalog";
import { addDays, helsinkiDate, nextMidnight } from "@/lib/quiz/date";
import { dateSchema } from "@/lib/quiz/schema";
import { evaluateAnswer, totalScore } from "@/lib/quiz/score";
import type { QuizResponse } from "@/lib/quiz/contracts";
import { getDailyQuiz } from "./bank";
const requestSchema = z.strictObject({
  date: dateSchema,
  mode: z.enum(["daily", "practice"]),
  answers: z.array(z.string().max(MAX_ANSWER_LENGTH)).max(30),
  releaseId: z.string().max(80).optional(),
});
export class GameError extends Error {
  constructor(
    public code: string,
    public status: number,
    message: string,
  ) {
    super(message);
  }
}
export function play(input: unknown, now = new Date()): QuizResponse {
  const parsed = requestSchema.safeParse(input);
  if (!parsed.success)
    throw new GameError(
      "INVALID_REQUEST",
      400,
      "Vastauksen tiedot eivät kelpaa. Päivitä sivu ja yritä uudelleen.",
    );
  const { date, mode, answers, releaseId } = parsed.data;
  const today = helsinkiDate(now);
  if (mode === "daily" && date !== today)
    throw new GameError(
      "DAY_CHANGED",
      409,
      "Päivä vaihtui. Uusi päivän visa odottaa sinua.",
    );
  if (
    date < FIRST_QUIZ_DATE ||
    (mode === "practice" && (date >= today || date < addDays(today, -30)))
  ) {
    throw new GameError(
      "UNAVAILABLE",
      400,
      "Harjoiteltavissa ovat edellisten 30 päivän visat.",
    );
  }
  const quiz = getDailyQuiz(date);
  if (releaseId && quiz.releaseId !== releaseId)
    throw new GameError(
      "RELEASE_CHANGED",
      409,
      "Visa on päivittynyt. Lataa sivu uudelleen.",
    );
  if (answers.length > quiz.questions.length)
    throw new GameError("INVALID_REQUEST", 400, "Vastauksia on liikaa.");
  // Only submitted positions are evaluated. No accepted-answer collection ever crosses this boundary.
  const results = answers.map((answer, index) =>
    evaluateAnswer(quiz.questions[index], answer, mode === "daily"),
  );
  const current = quiz.questions[answers.length];
  return {
    date,
    today,
    mode,
    releaseId: quiz.releaseId,
    length: quiz.questions.length,
    serverNow: now.toISOString(),
    nextRollover: nextMidnight(now).toISOString(),
    results,
    current: current
      ? {
          id: current.id,
          question: current.question,
          category: current.category,
          number: answers.length + 1,
        }
      : null,
    summary: current ? null : totalScore(results),
  };
}
