import { CATEGORIES } from "./catalog";
import { helsinkiDate } from "./date";
import { normalizeAnswer } from "./normalize";
import { questionSchema, type Question } from "./schema";
export type BankIssue = {
  severity: "error" | "warning";
  id: string;
  message: string;
};
export function validateBank(
  input: unknown,
  date = helsinkiDate(),
): { questions: Question[]; issues: BankIssue[] } {
  const issues: BankIssue[] = [];
  const questions: Question[] = [];
  const issue = (
    severity: BankIssue["severity"],
    id: string,
    message: string,
  ) => issues.push({ severity, id, message });
  if (!Array.isArray(input))
    return {
      questions,
      issues: [
        { severity: "error", id: "bank", message: "Bank must be an array" },
      ],
    };
  const ids = new Set<string>();
  const texts = new Map<string, string>();
  const tokens: { id: string; words: Set<string> }[] = [];
  input.forEach((record, index) => {
    const parsed = questionSchema.safeParse(record);
    if (!parsed.success) {
      issue(
        "error",
        `record-${index}`,
        parsed.error.issues
          .map((i) => `${i.path.join(".")}: ${i.message}`)
          .join("; "),
      );
      return;
    }
    const q = parsed.data;
    questions.push(q);
    if (ids.has(q.id)) issue("error", q.id, "Duplicate question ID");
    ids.add(q.id);
    const text = normalizeAnswer(q.question);
    if (texts.has(text))
      issue("error", q.id, `Duplicate question text with ${texts.get(text)}`);
    texts.set(text, q.id);
    const words = new Set(text.split(" "));
    // Jaccard similarity is a review hint only: semantic duplicates still need an editor.
    for (const other of tokens) {
      const intersection = [...words].filter((w) => other.words.has(w)).length;
      const similarity =
        intersection / (words.size + other.words.size - intersection);
      if (similarity >= 0.8 && words.size >= 5)
        issue("warning", q.id, `Near-identical text with ${other.id}`);
    }
    tokens.push({ id: q.id, words });
    const aliases = new Map<string, number>();
    q.answers.forEach((answer, answerIndex) => {
      for (const alias of [answer.canonical, ...answer.aliases]) {
        const key = normalizeAnswer(alias);
        if (!key) issue("error", q.id, "Answer normalizes to empty text");
        const previous = aliases.get(key);
        if (previous !== undefined)
          issue(
            previous === answerIndex ? "warning" : "error",
            q.id,
            `Normalized alias collision: ${alias}`,
          );
        aliases.set(key, answerIndex);
      }
    });
    if (q.validUntil && q.validUntil < date)
      issue("warning", q.id, "Expired question (automatically excluded)");
  });
  for (const category of Object.keys(CATEGORIES)) {
    if (
      !questions.some((q) => q.category === category && q.status === "active")
    )
      issue("error", category, "Missing active category");
  }
  return { questions, issues };
}
