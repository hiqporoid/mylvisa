import { readFile, writeFile } from 'node:fs/promises';
import snapshot from '../src/data/releases/2026-09-13.json';
import { questionSchema, type Question } from '../src/lib/quiz/schema';
import { selectDailySchedule } from '../src/lib/quiz/selection';
import { selectDailyQuestions as legacy } from '../src/lib/quiz/selection-legacy';
import { addDays } from '../src/lib/quiz/date';
import { CATEGORIES } from '../src/lib/quiz/catalog';
import { compileBetaContent } from '../src/data/compile-beta-content';

const epoch = '2026-09-13';
const bank = snapshot.map(q => questionSchema.parse(q));
const audit = new Map((await readFile('docs/internal/daily-difficulty-audit-2026-09.tsv','utf8')).trim().split('\n').map(line => {
  const [id, classification, prompt] = line.split('\t');
  return [id, { classification, prompt }] as const;
}));
const projection = bank.filter(q => q.dailyEligible && audit.get(q.id)?.classification !== 'RETIRE').map(q => ({
  ...q, difficulty: audit.get(q.id)?.classification === 'HARD' ? 'hard' as const : 'standard' as const,
  prompt: audit.get(q.id)?.prompt || q.prompt,
}));
function metrics(schedule: Question[][]) {
  const seen = new Set<string>();
  const categories: Record<string, number> = Object.fromEntries(Object.keys(CATEGORIES).map(key => [key, 0]));
  let firstRepeat: number | null = null;
  let familyCollisions = 0, baseCollisions = 0, universeCollisions = 0, maxDigital = 0;
  let maximumConsecutiveDayCategoryOverlap = 0;
  let previous = new Set<string>();
  const hardCounts: number[] = [];
  const hardPositions = new Set<number>();
  const categoryStreaks = new Map<string, number>();
  let longestCategoryStreak = 0;
  schedule.forEach((quiz, day) => {
    hardCounts.push(quiz.filter(q => (q.difficulty ?? (audit.get(q.id)?.classification === 'HARD' ? 'hard' : 'standard')) === 'hard').length);
    familyCollisions += quiz.length - new Set(quiz.map(q => q.familyId)).size;
    baseCollisions += quiz.length - new Set(quiz.map(q => q.baseUniverseId ?? q.universeId)).size;
    universeCollisions += quiz.length - new Set(quiz.map(q => q.universeId)).size;
    maxDigital = Math.max(maxDigital, quiz.filter(q => ['videopelit','internet-ja-digikulttuuri'].includes(q.category)).length);
    const dayCategories = new Set<string>(quiz.map(q => q.category));
    maximumConsecutiveDayCategoryOverlap = Math.max(maximumConsecutiveDayCategoryOverlap, [...dayCategories].filter(c => previous.has(c)).length);
    for (const category of Object.keys(CATEGORIES)) {
      const streak = dayCategories.has(category) ? (categoryStreaks.get(category) ?? 0) + 1 : 0;
      categoryStreaks.set(category, streak);
      longestCategoryStreak = Math.max(longestCategoryStreak, streak);
    }
    quiz.forEach((q, position) => {
      if (seen.has(q.id) && firstRepeat === null) firstRepeat = day;
      seen.add(q.id); categories[q.category]++;
      if (q.difficulty === 'hard') hardPositions.add(position + 1);
    });
    previous = dayCategories;
  });
  return { days: schedule.length, firstDate: epoch, lastDate: addDays(epoch, schedule.length - 1), earliestExactRepeatDate: firstRepeat === null ? null : addDays(epoch, firstRepeat), repeatFreeCompleteDays: firstRepeat, hardPerDaily: hardCounts, maximumHard: Math.max(...hardCounts), daysOverOneHard: hardCounts.filter(n => n > 1).length, hardPositions: [...hardPositions].sort(), categoryFrequencies: categories, familyCollisions, baseCollisions, universeCollisions, maximumGamingDigital: maxDigital, maximumConsecutiveDayCategoryOverlap, longestCategoryStreak };
}
const report = {
  warning: 'Projection only is NOT an approved bank. Original source reconciliation is unfinished. Legacy hard counts use the new semantic audit, not historic difficulty metadata.',
  publishedBank: metrics(Array.from({length:120}, (_, day) => legacy(bank, addDays(epoch, day), {epoch,seed:'2026-09-13-mylvinta-v5'}))),
  auditedOriginalsProjectionOnly: metrics(selectDailySchedule(projection, addDays(epoch,119), {epoch,seed:'beta-draft'})),
  currentSourceCheckedDraft: metrics(selectDailySchedule(compileBetaContent(), addDays(epoch,119), {epoch,seed:'beta-content-draft'})),
};
await writeFile('docs/internal/beta-selection-simulation-2026-09.json', `${JSON.stringify(report,null,2)}\n`);
for (const [name, metric] of Object.entries(report)) if (typeof metric !== 'string') console.log(name, JSON.stringify({...metric,hardPerDaily:undefined,categoryFrequencies:undefined}));
