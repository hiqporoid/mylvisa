import type { Question } from "./schema";
import { DEFAULT_QUIZ_LENGTH, DIFFICULTIES } from "./catalog";
import { addDays, dayNumber } from "./date";
export const SELECTION_VERSION = "deck-v1";
export function hash(value: string): number {
  let result = 2166136261;
  for (let i = 0; i < value.length; i++)
    result = Math.imul(result ^ value.charCodeAt(i), 16777619);
  return result >>> 0;
}
export function isEligible(q: Question, date: string): boolean {
  return (
    q.status === "active" &&
    (!q.validFrom || q.validFrom <= date) &&
    (!q.validUntil || q.validUntil >= date)
  );
}
/** Build a fresh, diverse deck each cycle; draw without replacement until the next cycle.
 * The release and engine version are frozen for a date. Input order never affects output.
 * Remainders shorter than one quiz rest for that cycle. Boundaries may repeat questions.
 */
export function selectDailyQuestions(
  bank: readonly Question[],
  date: string,
  options: { length?: number; seed?: string; epoch?: string } = {},
): Question[] {
  const length = options.length ?? DEFAULT_QUIZ_LENGTH;
  if (!Number.isInteger(length) || length < 1 || length > 30)
    throw new Error("Quiz length must be 1–30");
  const epoch = options.epoch ?? "2026-09-01";
  const elapsed = dayNumber(date) - dayNumber(epoch);
  if (elapsed < 0) throw new Error("Date precedes bank release");
  // Use the release's full active size for fixed cycle boundaries, even when validity changes.
  const cycleDays = Math.max(
    1,
    Math.floor(bank.filter((q) => q.status === "active").length / length),
  );
  const cycle = Math.floor(elapsed / cycleDays);
  const dayInCycle = elapsed % cycleDays;
  const seed = `${SELECTION_VERSION}:${options.seed ?? "mylvisa"}:${cycle}`;
  const used = new Set<string>();
  let selected: Question[] = [];
  for (let day = 0; day <= dayInCycle; day++) {
    const dayKey = addDays(epoch, cycle * cycleDays + day);
    const eligible = bank.filter((q) => isEligible(q, dayKey));
    if (eligible.length < length)
      throw new Error("Not enough active questions for this date");
    selected = [];
    const fresh = eligible.filter((q) => !used.has(q.id));
    const pool = fresh.length >= length ? fresh : eligible;
    // Largest-remainder quotas spread scarce difficulties across the entire deck.
    const allocations = DIFFICULTIES.map((difficulty) => {
      const ideal =
        (pool.filter((q) => q.difficulty === difficulty).length * length) /
        pool.length;
      return { difficulty, count: Math.floor(ideal), remainder: ideal % 1 };
    });
    let unassigned = length - allocations.reduce((sum, a) => sum + a.count, 0);
    for (const allocation of [...allocations].sort(
      (a, b) => b.remainder - a.remainder,
    )) {
      if (unassigned-- > 0) allocation.count++;
    }
    const quotas = new Map(allocations.map((a) => [a.difficulty, a.count]));
    const categories = new Set<string>();
    const difficulties = new Map<string, number>();
    for (let slot = 0; slot < length; slot++) {
      const targetDifficulty = DIFFICULTIES[(day + slot) % DIFFICULTIES.length];
      const candidates = eligible.filter(
        (q) => !selected.some((s) => s.id === q.id),
      );
      const rank = (q: Question) => [
        Number(used.has(q.id)),
        Number(
          (difficulties.get(q.difficulty) ?? 0) >=
            (quotas.get(q.difficulty) ?? 0),
        ),
        Number(categories.has(q.category)),
        difficulties.get(q.difficulty) ?? 0,
        Number(q.difficulty !== targetDifficulty),
        hash(`${seed}:${day}:${slot}:${q.id}`),
      ];
      // A linear minimum avoids repeatedly hashing every comparison in a sort.
      let q = candidates[0];
      let bestRank = rank(q);
      for (const candidate of candidates.slice(1)) {
        const candidateRank = rank(candidate);
        let comparison = 0;
        for (let i = 0; i < bestRank.length; i++) {
          if (candidateRank[i] !== bestRank[i]) {
            comparison = candidateRank[i] - bestRank[i];
            break;
          }
        }
        if (comparison < 0 || (comparison === 0 && candidate.id < q.id)) {
          q = candidate;
          bestRank = candidateRank;
        }
      }
      selected.push(q);
      used.add(q.id);
      categories.add(q.category);
      difficulties.set(q.difficulty, (difficulties.get(q.difficulty) ?? 0) + 1);
    }
  }
  return selected;
}
