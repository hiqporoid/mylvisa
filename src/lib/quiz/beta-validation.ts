import type { BetaContent } from '../../data/beta-content';
import { CATEGORIES, SCORE_TIERS } from './catalog';
import { isDateKey } from './date';
import { normalizeAnswer } from './normalize';

/** Structural checks cannot establish factual truth or population recall rates. */
export function validateBetaContent(bank: readonly BetaContent[]): string[] {
  const issues: string[] = [];
  const ids = new Set<string>();
  for (const q of bank) {
    const fail = (message: string) => issues.push(`${q.id}: ${message}`);
    if (ids.has(q.id)) fail('duplicate question');
    ids.add(q.id);
    if (!q.prompt.trim() || !q.familyId || !(q.category in CATEGORIES)) fail('missing prompt/family/category');
    if (!['standard', 'hard'].includes(q.difficulty)) fail('explicit difficulty required');
    if (!isDateKey(q.asOf) || !isDateKey(q.source.checkedOn)) fail('invalid source dates');
    if (q.source.status !== 'verified' || !['first-party','institutional'].includes(q.source.authority)) fail('unverified source authority');
    if (!q.source.url.startsWith('https://') || !q.source.title || !q.source.definition) fail('missing provenance');
    if (q.source.expectedCount !== q.answers.length) fail('source count and enumerated membership differ');
    if (q.answers.length < 6) fail('universe below six answers');
    if (!q.answers.some(a => a.points === 10 || a.points === 15)) fail('missing entry tier');
    if (!q.answers.some(a => a.points === 100)) fail('missing exceptional tier');
    for (const dimension of ['accessibility', 'rarity', 'completeness', 'aliases'] as const)
      if (!q.review[dimension]?.trim()) fail(`missing explicit ${dimension} review`);
    const owners = new Map<string, string>();
    const canonicals = new Set<string>();
    for (const answer of q.answers) {
      const canonicalKey = normalizeAnswer(answer.canonical);
      if (canonicals.has(canonicalKey)) fail("duplicate canonical member");
      canonicals.add(canonicalKey);
      if (!(SCORE_TIERS as readonly number[]).includes(answer.points)) fail('unsupported rarity');
      for (const form of [answer.canonical, ...answer.aliases, ...(answer.intentAliases ?? [])]) {
        const key = normalizeAnswer(form);
        if (!key) fail('empty answer form');
        const owner = owners.get(key);
        if (owner && owner !== answer.canonical) fail(`ambiguous alias ${form}`);
        owners.set(key, answer.canonical);
      }
    }
  }
  return issues;
}

export function betaReleaseBlockers(bank: readonly BetaContent[]): string[] {
  const blockers = validateBetaContent(bank);
  if (bank.length < 300) blockers.push('Daily bank below the 300-question public-beta minimum');
  for (const category of Object.keys(CATEGORIES))
    if (!bank.some(q => q.category === category)) blockers.push(`Missing Daily category: ${category}`);
  const hard = bank.filter(q => q.difficulty === 'hard').length;
  if (hard > Math.floor(bank.length / 7)) blockers.push('Too many hard questions to consume the bank at one hard per Daily');
  const gaming = bank.filter(q => ['videopelit', 'internet-ja-digikulttuuri'].includes(q.category)).length;
  if (gaming > bank.length * .15) blockers.push('Gaming/digital exceeds 15% bank concentration');
  return blockers;
}
