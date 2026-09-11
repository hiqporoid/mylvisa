import { DEFAULT_QUIZ_LENGTH, FIRST_QUIZ_DATE } from "./catalog";
import { addDays, dayNumber } from "./date";
import type { Question } from "./schema";

export const SELECTION_VERSION = "rarity-deck-v2";

export function hash(value: string): number {
  let result = 2166136261;
  for (let index = 0; index < value.length; index++)
    result = Math.imul(result ^ value.charCodeAt(index), 16777619);
  return result >>> 0;
}

export function isEligible(question: Question, date: string): boolean {
  return (
    question.status === "active" &&
    question.dailyEligible &&
    question.contentReview === "verified" &&
    question.rarityReview === "editorial-reviewed" &&
    question.accessibilityReview === "verified" &&
    question.accessibility >= 4 &&
    Math.max(...question.answers.map((answer) => answer.points)) === 100 &&
    question.answers.some((answer) => answer.points === 10 || answer.points === 15) &&
    (!question.validFrom || question.validFrom <= date) &&
    (!question.validUntil || question.validUntil >= date)
  );
}

function compareRank(a: number[], b: number[]): number {
  for (let index = 0; index < a.length; index++) {
    if (a[index] !== b[index]) return a[index] - b[index];
  }
  return 0;
}

/**
 * Select a deterministic, category-diverse deck. A cycle consumes every active
 * question once when the bank is large enough, which gives a practical 90-day
 * no-repeat horizon for a 630-question bank and 36 days for the seed bank.
 */
export function selectDailyQuestions(
  bank: readonly Question[],
  date: string,
  options: { length?: number; seed?: string; epoch?: string } = {},
): Question[] {
  const length = options.length ?? DEFAULT_QUIZ_LENGTH;
  if (!Number.isInteger(length) || length < 1 || length > 30)
    throw new Error("Quiz length must be 1–30");
  const epoch = options.epoch ?? FIRST_QUIZ_DATE;
  const elapsed = dayNumber(date) - dayNumber(epoch);
  if (elapsed < 0) throw new Error("Date precedes bank release");
  const activeCount = bank.filter((question) => isEligible(question, date)).length;
  const cycleDays = Math.max(1, Math.floor(activeCount / length));
  const cycle = Math.floor(elapsed / cycleDays);
  const dayInCycle = elapsed % cycleDays;
  const seed = `${SELECTION_VERSION}:${options.seed ?? "mylvisa"}:${cycle}`;
  const used = new Set<string>();
  let selected: Question[] = [];

  for (let day = 0; day <= dayInCycle; day++) {
    const dayKey = addDays(epoch, cycle * cycleDays + day);
    const eligible = bank.filter((question) => isEligible(question, dayKey));
    if (eligible.length < length) throw new Error("Not enough active questions for this date");
    selected = [];
    const fresh = eligible.filter((question) => !used.has(question.id));
    const pool = fresh.length >= length ? fresh : eligible;
    const categories = new Set<string>();
    const universes = new Set<string>();
    for (let slot = 0; slot < length; slot++) {
      const candidates = pool.filter((question) => !selected.some((item) => item.id === question.id));
      let best = candidates[0];
      let bestRank = [
        Number(universes.has(best.universeId)),
        Number(categories.has(best.category)),
        hash(`${seed}:${day}:${slot}:${best.id}`),
      ];
      for (const candidate of candidates.slice(1)) {
        const rank = [
          Number(universes.has(candidate.universeId)),
          Number(categories.has(candidate.category)),
          hash(`${seed}:${day}:${slot}:${candidate.id}`),
        ];
        const comparison = compareRank(rank, bestRank);
        if (comparison < 0 || (comparison === 0 && candidate.id < best.id)) {
          best = candidate;
          bestRank = rank;
        }
      }
      selected.push(best);
      used.add(best.id);
      categories.add(best.category);
      universes.add(best.universeId);
    }
  }
  return selected;
}
