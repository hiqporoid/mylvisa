import { selectDailyQuestions as selectLegacyDailyQuestions } from "./selection-legacy";
import { DEFAULT_QUIZ_LENGTH, FIRST_QUIZ_DATE } from "./catalog";
import { addDays, dayNumber } from "./date";
import type { Question } from "./schema";

export const SELECTION_VERSION = "rarity-deck-v5";

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
    (question.difficulty === "standard" || question.difficulty === "hard") &&
    question.answers.length >= 6 &&
    Math.max(...question.answers.map((answer) => answer.points)) === 100 &&
    question.answers.some((answer) => answer.points === 10 || answer.points === 15) &&
    (!question.validFrom || question.validFrom <= date) &&
    (!question.validUntil || question.validUntil >= date)
  );
}

/** Content accessibility is separate from the rarity of individual answers. */
export function selectDailySchedule(
  bank: readonly Question[],
  date: string,
  options: { length?: number; seed?: string; epoch?: string } = {},
): Question[][] {
  const length = options.length ?? DEFAULT_QUIZ_LENGTH;
  if (!Number.isInteger(length) || length < 1 || length > 30)
    throw new Error("Quiz length must be 1–30");
  const epoch = options.epoch ?? FIRST_QUIZ_DATE;
  const elapsed = dayNumber(date) - dayNumber(epoch);
  if (elapsed < 0) throw new Error("Date precedes bank release");
  const lastUsed = new Map<string, number>();
  const categoryUses = new Map<string, number>();
  let previousCategories = new Set<string>();
  let selected: Question[] = [];
  const schedule: Question[][] = [];
  const seed = `${SELECTION_VERSION}:${options.seed ?? "mylvisa"}`;
  for (let day = 0; day <= elapsed; day++) {
    const dayKey = addDays(epoch, day);
    const eligible = bank.filter(question => isEligible(question, dayKey));
    selected = [];
    const categories = new Set<string>();
    const bases = new Set<string>();
    const universes = new Set<string>();
    const dailyCategoryUses = new Map<string, number>();
    const families = new Set<string>();
    const hardSlot = 1 + hash(`${seed}:${day}:hard-position`) % Math.max(1, length - 1);
    let hardCount = 0;
    let digitalCount = 0;
    const digital = (q: Question) => q.category === "videopelit" || q.category === "internet-ja-digikulttuuri";
    for (let slot = 0; slot < length; slot++) {
      const candidates = eligible.filter(q =>
        !selected.some(item => item.id === q.id) &&
        !bases.has(q.baseUniverseId ?? q.universeId) &&
        !universes.has(q.universeId) &&
        (dailyCategoryUses.get(q.category) ?? 0) < 2 &&
        !(categories.has(q.category) && categories.size + length - slot - 1 < Math.min(5, length)) &&
        !families.has(q.familyId) &&
        !(q.difficulty === "hard" && (slot === 0 || hardCount >= 1)) &&
        !(digital(q) && (digitalCount >= 2 || categories.has(q.category)))
      );
      const rank = (q: Question) => [
        lastUsed.get(q.id) ?? -1,
        Number(categories.has(q.category)),
        Number(previousCategories.has(q.category)),
        categoryUses.get(q.category) ?? 0,
        hash(`${seed}:${day}:${slot}:${q.id}`),
      ];
      const ranked = candidates.map(question => ({ question, rank: rank(question) }));
      ranked.sort((a, b) => {
        const ar = a.rank, br = b.rank;
        for (let i = 0; i < ar.length; i++) if (ar[i] !== br[i]) return ar[i] - br[i];
        return a.question.id.localeCompare(b.question.id);
      });
      const best = ranked[0]?.question;
      if (!best) throw new Error("Not enough independent standard questions for a safe Daily");
      selected.push(best);
      lastUsed.set(best.id, day);
      categories.add(best.category);
      dailyCategoryUses.set(best.category, (dailyCategoryUses.get(best.category) ?? 0) + 1);
      universes.add(best.universeId);
      categoryUses.set(best.category, (categoryUses.get(best.category) ?? 0) + 1);
      bases.add(best.baseUniverseId ?? best.universeId);
      families.add(best.familyId);
      hardCount += Number(best.difficulty === "hard");
      digitalCount += Number(digital(best));
    }
    const hardIndex = selected.findIndex(question => question.difficulty === "hard");
    if (hardIndex >= 0) {
      const [hardQuestion] = selected.splice(hardIndex, 1);
      selected.splice(hardSlot, 0, hardQuestion);
    }
    previousCategories = categories;
    schedule.push(selected);
  }
  return schedule;
}

export function selectDailyQuestions(
  bank: readonly Question[], date: string,
  options: { length?: number; seed?: string; epoch?: string } = {},
): Question[] {
  // Published pre-difficulty snapshots must retain their exact historic ordering.
  if (bank.every(question => question.difficulty === undefined))
    return selectLegacyDailyQuestions(bank, date, options);
  return selectDailySchedule(bank, date, options).at(-1)!;
}
