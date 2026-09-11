import { RARITY_TIERS, SCORE_TIERS } from "./catalog";
import { normalizeAnswer, transpositionVariants } from "./normalize";
import type { Question } from "./schema";

const rarityRank = new Map<number, number>(SCORE_TIERS.map((points, index) => [points, index + 1]));

/** Exact matching first, then one adjacent transposition if it maps uniquely. */
export function matchAnswer(question: Question, input: string) {
  const normalized = normalizeAnswer(input);
  if (!normalized) return undefined;
  const candidates = question.answers.filter((answer) =>
    [answer.canonical, ...answer.aliases].some((value) => normalizeAnswer(value) === normalized),
  );
  if (candidates.length === 1) return candidates[0];
  if (candidates.length > 1) return undefined;

  const transposed = new Set(transpositionVariants(normalized));
  const typoCandidates = question.answers.filter((answer) =>
    [answer.canonical, ...answer.aliases].some((value) => transposed.has(normalizeAnswer(value))),
  );
  return typoCandidates.length === 1 ? typoCandidates[0] : undefined;
}

export function evaluateAnswer(question: Question, input: string, scored = true) {
  const match = matchAnswer(question, input);
  const points = scored && match ? match.points : 0;
  const maxPoints = scored && question.answers.length
    ? Math.max(...question.answers.map((answer) => answer.points))
    : 0;
  return {
    id: question.id,
    prompt: question.prompt,
    category: question.category,
    answer: input,
    accepted: Boolean(match),
    ...(match ? { canonicalAnswer: match.canonical } : {}),
    points,
    maxPoints,
    ...(match
      ? {
          tier: RARITY_TIERS[match.points as keyof typeof RARITY_TIERS],
          rarityRank: rarityRank.get(match.points) ?? 0,
        }
      : { rarityRank: 0 }),
    explanation: match?.explanation ?? question.explanation,
  };
}

export type EvaluatedAnswer = ReturnType<typeof evaluateAnswer>;

export function totalScore(results: EvaluatedAnswer[]) {
  return results.reduce(
    (total, result) => ({
      points: total.points + result.points,
      maxPoints: total.maxPoints + result.maxPoints,
      correct: total.correct + Number(result.accepted),
    }),
    { points: 0, maxPoints: 0, correct: 0 },
  );
}
