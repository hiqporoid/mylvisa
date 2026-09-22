import { describe, expect, it } from 'vitest';
import { selectDailyQuestions, selectDailySchedule } from '../src/lib/quiz/selection';
import { selectDailyQuestions as legacy } from '../src/lib/quiz/selection-legacy';
import { addDays } from '../src/lib/quiz/date';
import { questionSchema, type Question } from '../src/lib/quiz/schema';
import snapshot from '../src/data/releases/2026-09-13.json';

const example = questionSchema.parse(snapshot.find(q => q.id === 'suomi-presidentit'));
function fixture(count: number): Question[] {
  return Array.from({ length: count }, (_, n) => ({ ...example, id: `fixture-${n}`, universeId: `universe-${n}`, familyId: `family-${n}`, difficulty: n % 10 === 0 ? 'hard' : 'standard', category: (['suomi', 'musiikki', 'maantiede', 'urheilu', 'luonto', 'tiede', 'maailma'] as const)[n % 7] }));
}
describe('content difficulty selector', () => {
  it('enforces max one hard, a standard opening and 50 complete unused days over 120 dates', () => {
    const bank = fixture(360), seen = new Set<string>(), positions = new Set<number>();
    let firstRepeat = Infinity;
    const schedule = selectDailySchedule(bank, addDays('2026-09-14', 119), { epoch: '2026-09-14' });
    for (let day = 0; day < 120; day++) {
      const quiz = schedule[day];
      expect(quiz).toHaveLength(7);
      expect(quiz.filter(q => q.difficulty === 'hard').length).toBeLessThanOrEqual(1);
      expect(quiz[0].difficulty).toBe('standard');
      expect(new Set(quiz.map(q => q.category)).size).toBeGreaterThanOrEqual(5);
      expect(new Set(quiz.map(q => q.familyId)).size).toBe(7);
      expect(new Set(quiz.map(q => q.baseUniverseId ?? q.universeId)).size).toBe(7);
      quiz.forEach((q, position) => {
        if (seen.has(q.id)) firstRepeat = Math.min(firstRepeat, day);
        seen.add(q.id);
        if (q.difficulty === 'hard') positions.add(position);
      });
    }
    expect(firstRepeat).toBeGreaterThanOrEqual(50);
    expect(positions.size).toBeGreaterThan(1);
  });
  it('rejects a bank without enough standard questions instead of relaxing hard constraints', () => {
    expect(() => selectDailyQuestions(fixture(20).map(q => ({ ...q, difficulty: 'hard' })), '2026-09-14')).toThrow();
  });
  it('never selects sibling universes or excess digital categories', () => {
    const bank = fixture(60).map((q, n) => ({ ...q, baseUniverseId: `base-${n % 30}`, category: n % 8 === 0 ? 'videopelit' as const : n % 8 === 1 ? 'internet-ja-digikulttuuri' as const : q.category }));
    const quiz = selectDailyQuestions(bank, '2026-09-14');
    expect(new Set(quiz.map(q => q.baseUniverseId)).size).toBe(7);
    for (const category of ['videopelit', 'internet-ja-digikulttuuri']) expect(quiz.filter(q => q.category === category).length).toBeLessThanOrEqual(1);
  });
  it('keeps legacy snapshots unclassified and their original selector available', () => {
    const old = snapshot.map(q => questionSchema.parse(q));
    expect(old.every(q => q.difficulty === undefined)).toBe(true);
    for (let day = 0; day < 120; day++) {
      const date = addDays('2026-09-14', day);
      expect(selectDailyQuestions(old, date)).toEqual(legacy(old, date));
    }
  });
});
