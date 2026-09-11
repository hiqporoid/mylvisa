import { releases } from "../src/data/releases";
import { validateBank } from "../src/lib/quiz/validate";
import { CATEGORIES, SCORE_TIERS } from "../src/lib/quiz/catalog";
import { isDateKey } from "../src/lib/quiz/date";
let failed = false;
let previous = "";
const ids = new Set<string>();
for (const release of releases) {
  if (
    !isDateKey(release.effectiveFrom) ||
    release.effectiveFrom <= previous ||
    ids.has(release.id) ||
    !Number.isInteger(release.length) ||
    release.length < 1 ||
    release.length > 30
  ) {
    console.error("Invalid, duplicate or unordered release", release.id);
    failed = true;
  }
  ids.add(release.id);
  previous = release.effectiveFrom;
  const { questions, issues, quality } = validateBank(release.questions);
  console.log(`\n${release.id}: ${questions.length} kysymystä`);
  for (const issue of issues)
    console.log(
      `${issue.severity.toUpperCase()} ${issue.id}: ${issue.message}`,
    );
  if (issues.some((i) => i.severity === "error")) failed = true;
  for (const [category, label] of Object.entries(CATEGORIES))
    console.log(`${label}: ${questions.filter((q) => q.category === category && q.status === "active").length}`);
  console.log(`Vastauksia yhteensä: ${quality.answerCount}; mediaani / kysymys: ${quality.medianAnswers}`);
  console.log(`Pistejakauma: ${SCORE_TIERS.map((tier) => `${tier} ${quality.points[String(tier)] ?? 0}`).join(", ")}`);
  console.log(`Rarity-arvion tarkistettavat: ${quality.rarityReview.length}`);
  console.log(
    `${issues.filter((i) => i.severity === "error").length} errors, ${issues.filter((i) => i.severity === "warning").length} warnings`,
  );
}
process.exitCode = failed ? 1 : 0;
