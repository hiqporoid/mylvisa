import { betaContent } from './beta-content';
import { RARITY_TIERS } from '../lib/quiz/catalog';
import { questionSchema } from '../lib/quiz/schema';
import { validateBetaContent } from '../lib/quiz/beta-validation';

/** Compile explicitly reviewed records; this does not register or publish a release. */
export function compileBetaContent() {
  const issues = validateBetaContent(betaContent);
  if (issues.length) throw new Error(issues.join('\n'));
  return betaContent.map(q => questionSchema.parse({
    id: q.id, prompt: q.prompt, category: q.category, universeId: q.id,
    referenceDefinition: q.source.definition,
    completeness: { status: q.source.status, source: q.source.url, asOf: q.asOf, expectedCount: q.source.expectedCount, basis: q.source.definition },
    answers: q.answers.map(answer => ({
      ...answer, intentAliases: answer.intentAliases ?? [], tier: RARITY_TIERS[answer.points as keyof typeof RARITY_TIERS],
      editorialTier: String(answer.points), effectiveTier: String(answer.points), provenance: q.source.title,
    })),
    explanation: 'Pisteet arvioivat vastauksen spontaania muistamista. Lähdejoukko on rajattu kysymyksen viiteajankohtaan.',
    source: { title: q.source.title, url: q.source.url, note: q.source.definition },
    tags: [q.category, 'editorial-2026-09-22'], evergreen: true,
    status: 'active', dailyEligible: true, difficulty: q.difficulty,
    dailyEligibilityReason: q.dailyEligibilityReason,
    accessibilityReview: 'verified', accessibility: q.difficulty === 'standard' ? 5 : 4,
    familyId: q.familyId, version: 6, author: 'Mylvisa editorial 2026-09-22',
    contentReview: 'verified', rarityReview: 'editorial-reviewed', frequency: { status: 'pending' },
  }));
}
