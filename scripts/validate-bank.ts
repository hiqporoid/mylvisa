import { releases } from "../src/data/releases";
import { validateBank } from "../src/lib/quiz/validate";
import { CATEGORIES, FIRST_QUIZ_DATE, SCORE_TIERS } from "../src/lib/quiz/catalog";
import { addDays, isDateKey } from "../src/lib/quiz/date";
import { selectDailyQuestions } from "../src/lib/quiz/selection";
import { universeById } from "../src/data/universes";
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
  console.log(`\n${release.id}: ${questions.length} kysymystä (${quality.activeQuestionCount} aktiivista)`);
  console.log(`Daily-eligible: ${quality.dailyEligibleQuestionCount}; review/non-daily: ${quality.nonDailyRetainedCount}; retired: ${quality.retiredCount}`);
  for (const issue of issues)
    console.log(
      `${issue.severity.toUpperCase()} ${issue.id}: ${issue.message}`,
    );
  if (issues.some((i) => i.severity === "error")) failed = true;
  const daily = questions.filter((question) => question.dailyEligible);
  const dailyCategoryCounts = Object.fromEntries(Object.entries(CATEGORIES).map(([category, label]) => [label, daily.filter((question) => question.category === category).length]));
  const dailyAccessibility = Object.fromEntries([1, 2, 3, 4, 5].map((score) => [String(score), daily.filter((question) => question.accessibility === score).length]));
  const activeBaseUniverses = new Set(daily.filter((question) => !universeById.get(question.universeId)?.baseUniverseId).map((question) => question.universeId));
  const activeDerivedUniverses = new Set(daily.filter((question) => universeById.get(question.universeId)?.baseUniverseId).map((question) => question.universeId));
  console.log(`Daily-kategoriat: ${JSON.stringify(dailyCategoryCounts)}`);
  console.log(`Canonical-vastaukset: ${quality.answerCount}; mediaani / Daily-kysymys: ${quality.medianAnswers}`);
  console.log(`Verifioidut kantauniversumit: ${activeBaseUniverses.size}; johdetut Daily-universumit: ${activeDerivedUniverses.size}`);
  console.log(`Base-universumien keskittymä: ${JSON.stringify(Object.entries(quality.baseUniverseConcentration).slice(0, 10))}`);
  console.log(`100-pisteen Daily-puutteet: ${quality.dailyMissing100Count}; 10/15-entry-puutteet: ${quality.dailyMissingEntryCount}`);
  console.log(`Accessibility / Daily: ${JSON.stringify(dailyAccessibility)}`);
  console.log(`Pistejakauma: ${SCORE_TIERS.map((tier) => `${tier} ${quality.points[String(tier)] ?? 0}`).join(", ")}`);
  console.log(`Rarity-histogrammeja: ${Object.keys(quality.histograms).length}; rarity-arvion tarkistettavat: ${quality.rarityReview.length}`);
  const seen = new Set<string>();
  let firstRepeatDay = Number.POSITIVE_INFINITY;
  let familyCollisions = 0;
  let universeCollisions = 0;
  const simulationCategories = new Set<string>();
  for (let day = 0; day < 60; day++) {
    const quiz = selectDailyQuestions(questions, addDays(FIRST_QUIZ_DATE, day));
    familyCollisions += quiz.length - new Set(quiz.map((question) => question.familyId)).size;
    universeCollisions += quiz.length - new Set(quiz.map((question) => question.universeId)).size;
    for (const question of quiz) {
      if (seen.has(question.id)) firstRepeatDay = Math.min(firstRepeatDay, day);
      seen.add(question.id);
      simulationCategories.add(question.category);
    }
  }
  const repeatDate = Number.isFinite(firstRepeatDay) ? addDays(FIRST_QUIZ_DATE, firstRepeatDay) : "none";
  console.log(`60 päivän simulaatio: earliest exact repeat=${repeatDate}; repeat-free complete days=${firstRepeatDay}; categories=${simulationCategories.size}/${Object.keys(CATEGORIES).length}; same-family collisions=${familyCollisions}; universe collisions=${universeCollisions}`);
  console.log(`Rarity-arvion tarkistettavat: ${quality.rarityReview.length}`);
  console.log(
    `${issues.filter((i) => i.severity === "error").length} errors, ${issues.filter((i) => i.severity === "warning").length} warnings`,
  );
}
process.exitCode = failed ? 1 : 0;
