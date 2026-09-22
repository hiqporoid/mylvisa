import { readFile, writeFile } from 'node:fs/promises';
import { compileBetaContent } from '../src/data/compile-beta-content';
import { betaContent } from '../src/data/beta-content';
import { validateBetaContent } from '../src/lib/quiz/beta-validation';
import baseline from '../src/data/releases/2026-09-13.json';

const auditText = await readFile('docs/internal/daily-difficulty-audit-2026-09.tsv', 'utf8');
const rows = auditText.trim().split('\n').map(line => {
  const [id, classification, prompt, rationale] = line.split('\t');
  return { id, classification, prompt, rationale };
});
const baselineDaily = baseline.filter(question => question.dailyEligible);
if (rows.length !== baselineDaily.length || new Set(rows.map(row => row.id)).size !== rows.length || rows.some(row => !baselineDaily.some(question => question.id === row.id)))
  throw new Error('Every original Daily question requires exactly one explicit audit record');
for (const row of rows) {
  if (!['KEEP', 'RESCORE', 'REWRITE', 'HARD', 'RETIRE'].includes(row.classification) || !row.rationale)
    throw new Error(`Incomplete semantic audit: ${row.id}`);
  if (row.classification === 'REWRITE' && !row.prompt) throw new Error(`Missing rewrite: ${row.id}`);
}
const issues = validateBetaContent(betaContent);
if (issues.length) throw new Error(issues.join('\n'));
const draft = {
  status: 'NOT_READY_FOR_SMALL_PUBLIC_BETA',
  baselineCommit: '17762d237e8e7d21423ab84031e34b3e88e0a1e1',
  reviewedOn: '2026-09-22',
  note: 'Editorial working draft, never imported by runtime. Semantic review is not primary-source verification. Old immutable releases remain intact until replacement release gates pass.',
  baselineAudit: rows.map(row => {
    const original = baselineDaily.find(question => question.id === row.id)!;
    const reconciled = betaContent.find(question => question.id === row.id);
    return {
      ...row, prompt: reconciled?.prompt || row.prompt || original.prompt,
      difficulty: row.classification === 'RETIRE' ? null : row.classification === 'HARD' ? 'hard' : 'standard',
      disposition: row.classification === 'RETIRE' ? 'retired' : reconciled ? 'source-reconciled-draft' : 'candidate',
      dailyEligible: false,
      sourceReview: reconciled ? 'primary-source-reconciled' : 'pending-primary-source-reconciliation',
      previousUniverseId: original.universeId,
    };
  }),
  sourceCheckedAdditions: betaContent.filter(q => !baselineDaily.some(original => original.id === q.id)),
  sourceReconciledOriginals: betaContent.filter(q => baselineDaily.some(original => original.id === q.id)),
  compiledAdditions: compileBetaContent(),
};
await writeFile('docs/internal/beta-bank-draft-2026-09.json', `${JSON.stringify(draft, null, 2)}\n`);
console.log(`Draft: ${rows.length} individually audited originals; ${draft.sourceCheckedAdditions.length} source-checked additions; ${draft.sourceReconciledOriginals.length} source-reconciled originals. Not a production release.`);
