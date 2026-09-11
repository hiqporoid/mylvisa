import type { Question } from "./schema";
import { normalizeAnswer } from "./normalize";
export function matchAnswer(question: Question, input: string) {
  const normalized = normalizeAnswer(input);
  if (!normalized) return undefined;
  return question.answers.find((answer) =>
    [answer.canonical, ...answer.aliases].some(
      (value) => normalizeAnswer(value) === normalized,
    ),
  );
}
export function evaluateAnswer(
  question: Question,
  input: string,
  scored = true,
) {
  const match = matchAnswer(question, input);
  return {
    id: question.id,
    question: question.question,
    category: question.category,
    answer: input,
    accepted: Boolean(match),
    canonicalAnswer: match?.canonical ?? question.canonicalAnswer,
    points: scored ? (match?.points ?? 0) : 0,
    maxPoints: scored ? Math.max(...question.answers.map((a) => a.points)) : 0,
    explanation: match?.explanation ?? question.explanation,
  };
}
export function totalScore(results: ReturnType<typeof evaluateAnswer>[]) {
  return results.reduce(
    (total, result) => ({
      points: total.points + result.points,
      maxPoints: total.maxPoints + result.maxPoints,
      correct: total.correct + Number(result.accepted),
    }),
    { points: 0, maxPoints: 0, correct: 0 },
  );
}
