import { expect, it } from 'vitest';
import { readFileSync } from 'node:fs';
import { compileBetaContent } from '../src/data/compile-beta-content';
import { evaluateAnswer } from '../src/lib/quiz/score';
import { betaContent } from '../src/data/beta-content';
import { validateBetaContent, betaReleaseBlockers } from '../src/lib/quiz/beta-validation';
import baseline from '../src/data/releases/2026-09-13.json';

it('records an individual semantic decision for every baseline Daily', () => {
  const rows = readFileSync('docs/internal/daily-difficulty-audit-2026-09.tsv','utf8').trim().split('\n').map(line => line.split('\t'));
  expect(rows.map(row => row[0]).sort()).toEqual(baseline.filter(q => q.dailyEligible).map(q => q.id).sort());
  for (const row of rows) {
    expect(['KEEP','RESCORE','REWRITE','HARD','RETIRE']).toContain(row[1]);
    expect(row[3].length).toBeGreaterThan(20);
    if (row[1] === 'REWRITE') expect(row[2]).not.toBe('');
  }
});
it('requires explicit review evidence and complete declared membership for additions', () => {
  expect(validateBetaContent(betaContent)).toEqual([]);
  const missing = structuredClone(betaContent[0]);
  missing.answers.pop();
  missing.review.completeness = '';
  expect(validateBetaContent([missing])).toEqual(expect.arrayContaining([
    expect.stringContaining('count and enumerated membership differ'),
    expect.stringContaining('missing explicit completeness review'),
  ]));
});
it('fails closed on ambiguous aliases and removed editorial rarity tiers', () => {
  const bad = structuredClone(betaContent[0]);
  bad.answers[1].aliases.push(bad.answers[0].canonical);
  bad.answers.forEach(a => { a.points = 30; });
  expect(validateBetaContent([bad])).toEqual(expect.arrayContaining([
    expect.stringContaining('ambiguous alias'), expect.stringContaining('missing entry tier'), expect.stringContaining('missing exceptional tier'),
  ]));
});
it('reports the unfinished draft as blocked rather than granting a release waiver', () => {
  expect(betaReleaseBlockers(betaContent.slice(0, 1))).toContain('Daily bank below the 300-question public-beta minimum');
});

it('resolves the actual new answer aliases with their question-specific scores', () => {
  const bank = compileBetaContent();
  const champion = bank.find(q => q.id === 'beta-f1-world-champions')!;
  expect(evaluateAnswer(champion, 'Schumi').points).toBe(10);
  expect(evaluateAnswer(champion, 'Hulme').points).toBe(100);
  expect(evaluateAnswer(champion, 'Hill').accepted).toBe(false);
  expect(evaluateAnswer(bank.find(q => q.id === 'beta-nightwish-studio-albums')!, 'Human Nature').points).toBe(100);
  expect(evaluateAnswer(bank.find(q => q.id === 'beta-pokemon-types')!, 'sähkö').points).toBe(10);
  expect(evaluateAnswer(bank.find(q => q.id === 'beta-pokemon-types')!, 'Pikachu').accepted).toBe(false);
});
