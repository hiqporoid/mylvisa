import { CATEGORIES, SCORE_TIERS } from "./catalog";
import { helsinkiDate } from "./date";
import { normalizeAnswer } from "./normalize";
import { questionSchema, type Question } from "./schema";

export type BankIssue = { severity: "error" | "warning"; id: string; message: string };
export type BankQuality = {
  questionCount: number;
  medianAnswers: number;
  answerCount: number;
  points: Record<string, number>;
  categories: Record<string, number>;
  rarityReview: string[];
};

function median(values: number[]): number {
  if (!values.length) return 0;
  const sorted = [...values].sort((a, b) => a - b);
  const middle = Math.floor(sorted.length / 2);
  return sorted.length % 2 ? sorted[middle] : (sorted[middle - 1] + sorted[middle]) / 2;
}

export function validateBank(input: unknown, date = helsinkiDate()): { questions: Question[]; issues: BankIssue[]; quality: BankQuality } {
  const issues: BankIssue[] = [];
  const questions: Question[] = [];
  const issue = (severity: BankIssue["severity"], id: string, message: string) => issues.push({ severity, id, message });
  const quality: BankQuality = {
    questionCount: 0,
    medianAnswers: 0,
    answerCount: 0,
    points: Object.fromEntries(SCORE_TIERS.map((tier) => [String(tier), 0])),
    categories: Object.fromEntries(Object.keys(CATEGORIES).map((category) => [category, 0])),
    rarityReview: [],
  };
  if (!Array.isArray(input)) {
    issue("error", "bank", "Pankin pitää olla taulukko.");
    return { questions, issues, quality };
  }
  const ids = new Set<string>();
  const texts = new Map<string, string>();
  const textTokens: { id: string; words: Set<string> }[] = [];
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
    if (question.answers.length < 5) issue("error", question.id, "Setissä pitää olla vähintään viisi kanonista vastausta.");
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
      quality.answerCount++;
      quality.points[String(answer.points)] = (quality.points[String(answer.points)] ?? 0) + 1;
    });
    const canonicalOnly = new Map(question.answers.map((answer, answerIndex) => [normalizeAnswer(answer.canonical), answerIndex]));
    question.answers.forEach((answer, answerIndex) => {
      for (const alias of answer.aliases) {
        const owner = canonicalOnly.get(normalizeAnswer(alias));
        if (owner !== undefined && owner !== answerIndex) issue("error", question.id, `Alias equals another canonical answer: ${alias}.`);
      }
    });
    const vague = /\b(famous|important|major|best|popular|well-known|tunnettu|kuuluisa|tärkeä|merkittävä|paras|suosittu)\b/iu;
    if (vague.test(question.referenceDefinition) && !/\b(suljettu|luettelo|virallinen|tilasto|jäädytetty|sopimus|standardi)\b/iu.test(question.referenceDefinition))
      issue("warning", question.id, "Reference definition may be vague; name an objective frozen list or source.");
    if (question.validUntil && question.validUntil < date) issue("warning", question.id, "Expired question (automatically excluded).");
    if (question.rarityReview !== "verified") quality.rarityReview.push(question.id);
    quality.categories[question.category] = (quality.categories[question.category] ?? 0) + Number(question.status === "active");
  }
  quality.questionCount = questions.length;
  quality.medianAnswers = median(questions.map((question) => question.answers.length));
  for (const category of Object.keys(CATEGORIES))
    if (!questions.some((question) => question.category === category && question.status === "active")) issue("error", category, "Missing active category.");
  const activeCounts = Object.values(quality.categories);
  if (activeCounts.length && Math.max(...activeCounts) > Math.max(3, Math.min(...activeCounts) * 3))
    issue("warning", "categories", "Category distribution is strongly imbalanced.");
  return { questions, issues, quality };
}
