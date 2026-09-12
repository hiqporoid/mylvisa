import { CATEGORIES, SCORE_TIERS } from "./catalog";
import { helsinkiDate } from "./date";
import { normalizeAnswer } from "./normalize";
import { questionSchema, type Question } from "./schema";
import { universeById } from "@/data/universes";

export type BankIssue = { severity: "error" | "warning"; id: string; message: string };
export type BankQuality = {
  questionCount: number;
  activeQuestionCount: number;
  dailyEligibleQuestionCount: number;
  nonDailyRetainedCount: number;
  retiredCount: number;
  medianAnswers: number;
  answerCount: number;
  verifiedUniverseCount: number;
  derivedUniverseCount: number;
  accessibility: Record<string, number>;
  lowTierQuestionCount: number;
  max100QuestionCount: number;
  points: Record<string, number>;
  categories: Record<string, number>;
  baseUniverseConcentration: Record<string, number>;
  familyCollisionCount: number;
  dailyMissing100Count: number;
  dailyMissingEntryCount: number;
  rarityReview: string[];
  histograms: Record<string, number>;
};

function median(values: number[]): number {
  if (!values.length) return 0;
  const sorted = [...values].sort((a, b) => a - b);
  const middle = Math.floor(sorted.length / 2);
  return sorted.length % 2 ? sorted[middle] : (sorted[middle - 1] + sorted[middle]) / 2;
}

function histogram(question: Question): string {
  return SCORE_TIERS.map((tier) => `${tier}:${question.answers.filter((answer) => answer.points === tier).length}`).join(",");
}

function oldPositionalPattern(question: Question): boolean {
  const expected = question.answers.map((_, index, answers) => {
    if (index === 0) return 10;
    if (index === 1) return 15;
    if (index === answers.length - 1) return 100;
    if (index === answers.length - 2) return 85;
    if (index === answers.length - 3) return 60;
    return 30;
  });
  return question.answers.every((answer, index) => answer.points === expected[index]);
}

const snapshotPromptIds = new Set([
  "suomi-presidentit",
  "suomi-kansallispuistot",
  "suomi-unesco-kohteet",
  "suomi-maakunnat",
  "suomi-nobel-suomi",
  "kirjallisuus-nobel-kirjallisuus",
  "yhteiskunta-eu-jasenet",
  "yhteiskunta-g7",
  "musiikki-eurovision-voittajat",
  "urheilu-jalkapallon-maailmanmestarit",
]);

export function validateBank(input: unknown, date = helsinkiDate()): { questions: Question[]; issues: BankIssue[]; quality: BankQuality } {
  const issues: BankIssue[] = [];
  const questions: Question[] = [];
  const issue = (severity: BankIssue["severity"], id: string, message: string) => issues.push({ severity, id, message });
  const quality: BankQuality = {
    questionCount: 0,
    activeQuestionCount: 0,
    dailyEligibleQuestionCount: 0,
    nonDailyRetainedCount: 0,
    retiredCount: 0,
    medianAnswers: 0,
    answerCount: 0,
    verifiedUniverseCount: 0,
    derivedUniverseCount: 0,
    accessibility: Object.fromEntries([1, 2, 3, 4, 5].map((score) => [String(score), 0])),
    lowTierQuestionCount: 0,
    max100QuestionCount: 0,
    points: Object.fromEntries(SCORE_TIERS.map((tier) => [String(tier), 0])),
    categories: Object.fromEntries(Object.keys(CATEGORIES).map((category) => [category, 0])),
    baseUniverseConcentration: {},
    familyCollisionCount: 0,
    dailyMissing100Count: 0,
    dailyMissingEntryCount: 0,
    rarityReview: [],
    histograms: {},
  };
  if (!Array.isArray(input)) {
    issue("error", "bank", "Pankin pitää olla taulukko.");
    return { questions, issues, quality };
  }

  const ids = new Set<string>();
  const texts = new Map<string, string>();
  const textTokens: { id: string; words: Set<string> }[] = [];
  const indexPatterns = new Map<string, number>();
  const activeUniverseIds = new Set<string>();

  for (const [index, record] of input.entries()) {
    const parsed = questionSchema.safeParse(record);
    if (!parsed.success) {
      issue("error", `record-${index}`, parsed.error.issues.map((item) => `${item.path.join(".")}: ${item.message}`).join("; "));
      continue;
    }
    const question = parsed.data;
    questions.push(question);
    if (ids.has(question.id)) issue("error", question.id, "Duplicate question ID.");
    ids.add(question.id);
    const universe = universeById.get(question.universeId);
    if (!universe) {
      issue("error", question.id, `Unknown universe ${question.universeId}.`);
    } else {
      if (question.baseUniverseId && !universe.baseUniverseId)
        issue("error", question.id, "Derived question must reference a derived universe.");
      if (universe.expectedCount !== universe.entities.length)
        issue("error", question.id, `Universe declares ${universe.expectedCount} members but stores ${universe.entities.length}.`);
      if (question.completeness.status !== "verified") issue("error", question.id, "Active question has no verified completeness status.");
      if (question.completeness.source !== universe.source.url) issue("error", question.id, "Completeness source does not match the registered universe source.");
      if (question.completeness.asOf !== universe.asOf) issue("error", question.id, "Completeness reference date does not match the registered universe.");
      if (question.completeness.expectedCount !== universe.expectedCount) issue("error", question.id, "Expected canonical count does not match the registered universe.");
      if (question.answers.length !== universe.expectedCount) issue("error", question.id, `Expected ${universe.expectedCount} canonical answers, got ${question.answers.length}.`);
      const universeKeys = new Set(universe.entities.map((entity) => normalizeAnswer(entity.canonical)));
      const answerKeys = new Set(question.answers.map((answer) => normalizeAnswer(answer.canonical)));
      if (universeKeys.size !== answerKeys.size || [...universeKeys].some((key) => !answerKeys.has(key)))
        issue("error", question.id, "Stored canonical answers do not equal the verified universe membership.");
      if (question.source.url !== universe.source.url) issue("error", question.id, "Question source does not match the registered universe source.");
      if (snapshotPromptIds.has(question.id) && !/\b20\d{2}\b/u.test(question.prompt))
        issue("error", question.id, "Time-sensitive snapshot requires a visible reference year in the prompt.");
      if (question.status === "active") {
        if (activeUniverseIds.has(question.universeId)) issue("error", question.id, "Two active questions reference the same universe.");
        activeUniverseIds.add(question.universeId);
        quality.verifiedUniverseCount++;
      }
      if (universe.baseUniverseId) quality.derivedUniverseCount++;
    }

    if (question.status !== "retired") {
      const text = normalizeAnswer(question.prompt);
      const previous = texts.get(text);
      if (previous) issue("error", question.id, `Duplicate question text with ${previous}.`);
      texts.set(text, question.id);
      const words = new Set(text.split(" "));
      for (const other of textTokens) {
        const intersection = [...words].filter((word) => other.words.has(word)).length;
        const similarity = intersection / (words.size + other.words.size - intersection);
        if (similarity >= 0.8 && words.size >= 5) issue("warning", question.id, `Near-identical text with ${other.id}.`);
      }
      textTokens.push({ id: question.id, words });
    }

    const canonicalKeys = new Map<string, number>();
    question.answers.forEach((answer, answerIndex) => {
      const values = [answer.canonical, ...answer.aliases];
      for (const value of values) {
        const key = normalizeAnswer(value);
        if (!key) issue("error", question.id, "Answer normalizes to empty text.");
        const oldIndex = canonicalKeys.get(key);
        if (oldIndex !== undefined) issue("error", question.id, `Alias collision between answers ${oldIndex + 1} and ${answerIndex + 1}: ${value}.`);
        canonicalKeys.set(key, answerIndex);
      }
      if (!question.source.url || !question.source.title || !answer.provenance) issue("error", question.id, "Missing provenance.");
      if (!(SCORE_TIERS as readonly number[]).includes(answer.points)) issue("error", question.id, `Invalid point value ${answer.points}.`);
      quality.answerCount += Number(question.status === "active");
      if (question.status === "active") quality.points[String(answer.points)] = (quality.points[String(answer.points)] ?? 0) + 1;
    });
    const canonicalOnly = new Map(question.answers.map((answer, answerIndex) => [normalizeAnswer(answer.canonical), answerIndex]));
    question.answers.forEach((answer, answerIndex) => {
      for (const alias of answer.aliases) {
        const owner = canonicalOnly.get(normalizeAnswer(alias));
        if (owner !== undefined && owner !== answerIndex) issue("error", question.id, `Alias equals another canonical answer: ${alias}.`);
      }
    });

    if (question.status === "active") {
      const key = histogram(question);
      quality.histograms[key] = (quality.histograms[key] ?? 0) + 1;
      const pattern = question.answers.map((answer) => answer.points).join(",");
      indexPatterns.set(pattern, (indexPatterns.get(pattern) ?? 0) + 1);
      if (question.answers.length >= 5 && oldPositionalPattern(question)) issue("warning", question.id, "Rarity points still exactly follow the legacy positional template.");
    }
    if (question.validUntil && question.validUntil < date) issue("warning", question.id, "Expired question (automatically excluded).");
    if (question.status === "active" && (question.contentReview !== "verified" || question.rarityReview !== "editorial-reviewed"))
      issue("error", question.id, "Production-active question is not content- and rarity-reviewed.");
    if (question.status === "active" && question.completeness.status !== "verified") issue("error", question.id, "Production-active question references an unverified universe.");
    if (question.rarityReview !== "editorial-reviewed") quality.rarityReview.push(question.id);
    quality.categories[question.category] = (quality.categories[question.category] ?? 0) + Number(question.status === "active");
    quality.accessibility[String(question.accessibility)] = (quality.accessibility[String(question.accessibility)] ?? 0) + 1;
    const maximum = Math.max(...question.answers.map((answer) => answer.points));
    if (maximum === 100) quality.max100QuestionCount++;
    if (question.answers.some((answer) => answer.points === 10 || answer.points === 15)) quality.lowTierQuestionCount++;
    if (question.status === "active" && !question.dailyEligible) quality.nonDailyRetainedCount++;
    if (question.status === "review") quality.nonDailyRetainedCount++;
    if (question.status === "retired") quality.retiredCount++;
    if (question.dailyEligible) {
      quality.dailyEligibleQuestionCount++;
      if (question.status !== "active") issue("error", question.id, "Daily-eligible question must be active.");
      if (question.contentReview !== "verified") issue("error", question.id, "Daily question needs verified content review.");
      if (question.rarityReview !== "editorial-reviewed") issue("error", question.id, "Daily question needs editorial rarity review.");
      if (question.accessibilityReview !== "verified") issue("error", question.id, "Daily question needs verified accessibility review.");
      if (question.accessibility < 4) issue("error", question.id, "Daily question accessibility must be at least 4.");
      if (maximum !== 100) issue("error", question.id, `Daily question max score must be 100, got ${maximum}.`);
      if (!question.answers.some((answer) => answer.points === 10 || answer.points === 15))
        issue("error", question.id, "Daily question needs a 10- or 15-point entry answer.");
      if (question.answers.length < 3) issue("error", question.id, "Daily question needs at least three canonical answers.");
      if (question.answers.length < 8 && !question.dailyEligibilityReason)
        issue("error", question.id, "Daily question below eight answers needs an explicit exception.");
    }
  }

  quality.questionCount = questions.length;
  quality.activeQuestionCount = questions.filter((question) => question.status === "active").length;
  const dailyQuestions = questions.filter((question) => question.dailyEligible);
  const audienceCount = dailyQuestions.filter(question => question.category === "videopelit" || question.category === "internet-ja-digikulttuuri").length;
  if (audienceCount > dailyQuestions.length * 0.15)
    issue("error", "audience-concentration", "Gaming and digital culture exceed the 15% Daily cap.");
  quality.medianAnswers = median(dailyQuestions.map((question) => question.answers.length));
  const baseCounts = new Map<string, number>();
  for (const question of dailyQuestions) {
    const base = question.baseUniverseId ?? question.universeId;
    baseCounts.set(base, (baseCounts.get(base) ?? 0) + 1);
    if (!question.answers.some((answer) => answer.points === 100)) quality.dailyMissing100Count++;
    if (!question.answers.some((answer) => answer.points === 10 || answer.points === 15)) quality.dailyMissingEntryCount++;
  }
  quality.baseUniverseConcentration = Object.fromEntries([...baseCounts.entries()].sort((a, b) => b[1] - a[1]));
  const concentrationLimit = Math.ceil(Math.max(1, dailyQuestions.length) * 0.1);
  const topTwoConcentration = [...baseCounts.values()].sort((a, b) => b - a).slice(0, 2).reduce((sum, count) => sum + count, 0);
  if (Math.max(0, ...baseCounts.values()) > concentrationLimit)
    issue("error", "base-universe-concentration", `A base universe exceeds the 10% Daily cap (${concentrationLimit}).`);
  if (topTwoConcentration > Math.ceil(Math.max(1, dailyQuestions.length) * 0.18))
    issue("error", "base-universe-pair-concentration", "The top two base universes exceed the 18% Daily cap.");
  const dailyCategories = new Map<string, number>();
  for (const question of dailyQuestions) dailyCategories.set(question.category, (dailyCategories.get(question.category) ?? 0) + 1);
  for (const category of Object.keys(CATEGORIES)) {
    if ((dailyCategories.get(category) ?? 0) === 0) issue("error", `category-${category}`, "Every category must have at least one Daily question.");
    if (dailyQuestions.length >= 350 && (dailyCategories.get(category) ?? 0) < 10)
      issue("error", `category-floor-${category}`, "A READY-sized Daily bank needs at least 10 questions in every category.");
  }
  const activeFamilies = new Map<string, number>();
  for (const question of dailyQuestions) activeFamilies.set(question.familyId, (activeFamilies.get(question.familyId) ?? 0) + 1);
  quality.familyCollisionCount = [...activeFamilies.values()].filter((count) => count > 1).length;
  const non100 = Object.entries(quality.points).filter(([points]) => points !== "100").reduce((sum, [, count]) => sum + count, 0);
  const largestNon100 = Math.max(0, ...Object.entries(quality.points).filter(([points]) => points !== "100").map(([, count]) => count));
  if (non100 > 0 && largestNon100 / non100 > 0.8)
    issue("warning", "rarity-score-bucket", "More than 80% of non-100 canonical Daily answers share one score bucket.");
  const activeHistograms = Object.values(quality.histograms);
  if (activeHistograms.length && Math.max(...activeHistograms) >= Math.max(10, Math.ceil(quality.activeQuestionCount * 0.8)))
    issue("warning", "rarity-histograms", "Many active questions share the exact same rarity histogram; inspect for mechanical scoring.");
  const repeatedIndexPattern = Math.max(0, ...indexPatterns.values());
  if (repeatedIndexPattern >= Math.max(10, Math.ceil(quality.activeQuestionCount * 0.8)))
    issue("warning", "rarity-index-pattern", "Many active questions share the exact same answer-index-to-score pattern.");
  if (quality.dailyEligibleQuestionCount < 7) issue("error", "daily-count", "At least seven daily-eligible questions are required for a seven-round game.");
  const activeCounts = Object.values(quality.categories).filter((count) => count > 0);
  if (activeCounts.length && Math.max(...activeCounts) > Math.max(7, Math.min(...activeCounts) * 4))
    issue("warning", "categories", "Category distribution is strongly imbalanced.");
  return { questions, issues, quality };
}
