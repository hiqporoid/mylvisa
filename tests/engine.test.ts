import { describe, expect, it } from "vitest";
import { releases } from "@/data/releases";
import { CATEGORIES, SCORE_TIERS } from "@/lib/quiz/catalog";
import {
  addDays,
  helsinkiDate,
  isDateKey,
  nextMidnight,
} from "@/lib/quiz/date";
import { normalizeAnswer } from "@/lib/quiz/normalize";
import { questionSchema } from "@/lib/quiz/schema";
import { evaluateAnswer, matchAnswer, totalScore } from "@/lib/quiz/score";
import { isEligible, selectDailyQuestions } from "@/lib/quiz/selection";
import { validateBank } from "@/lib/quiz/validate";
const bank = releases[0].questions.map((q) => questionSchema.parse(q));
const ids = (date: string) => selectDailyQuestions(bank, date).map((q) => q.id);
describe("Finnish calendar and DST", () => {
  it.each([
    ["2026-09-10T20:59:59.999Z", "2026-09-10"],
    ["2026-09-10T21:00:00Z", "2026-09-11"],
    ["2026-01-10T21:59:59Z", "2026-01-10"],
    ["2026-01-10T22:00:00Z", "2026-01-11"],
    ["2026-03-29T00:59:59Z", "2026-03-29"],
    ["2026-03-29T01:00:00Z", "2026-03-29"],
    ["2026-10-25T00:59:59Z", "2026-10-25"],
    ["2026-10-25T01:00:00Z", "2026-10-25"],
  ])("%s belongs to %s", (instant, expected) =>
    expect(helsinkiDate(new Date(instant))).toBe(expected),
  );
  it.each([
    ["2026-03-28T22:00:00Z", "2026-03-29T21:00:00.000Z", 23],
    ["2026-10-24T21:00:00Z", "2026-10-25T22:00:00.000Z", 25],
    ["2026-09-10T21:00:00Z", "2026-09-11T21:00:00.000Z", 24],
  ])("finds the next midnight from %s", (start, expected, hours) => {
    const end = nextMidnight(new Date(start));
    expect(end.toISOString()).toBe(expected);
    expect(end.getTime() - Date.parse(start)).toBe(hours * 3_600_000);
  });
  it("validates real calendar dates", () => {
    expect(isDateKey("2026-02-29")).toBe(false);
    expect(isDateKey("2028-02-29")).toBe(true);
    expect(isDateKey("2026-13-01")).toBe(false);
    expect(isDateKey("11.9.2026")).toBe(false);
    expect(addDays("2026-12-31", 1)).toBe("2027-01-01");
  });
});
describe("deterministic daily deck", () => {
  it("same Helsinki date produces identical questions and order", () => {
    const a = helsinkiDate(new Date("2026-09-10T21:00:01Z"));
    const b = helsinkiDate(new Date("2026-09-11T20:59:59Z"));
    expect(ids(a)).toEqual(ids(b));
  });
  it("different dates, including cycle boundaries, have different quizzes", () => {
    for (let i = 0; i < 45; i++)
      expect(ids(addDays("2026-09-01", i))).not.toEqual(
        ids(addDays("2026-09-01", i + 1)),
      );
  });
  it("never duplicates a question in a quiz", () => {
    for (let i = 0; i < 40; i++)
      expect(new Set(ids(addDays("2026-09-01", i))).size).toBe(7);
  });
  it("does not repeat a question within a full 16-day seed-bank cycle", () => {
    const all = Array.from({ length: 16 }, (_, i) =>
      ids(addDays("2026-09-01", i)),
    ).flat();
    expect(new Set(all).size).toBe(112);
  });
  it("spreads the scarce hard questions over every day of the seed cycle", () => {
    for (let i = 0; i < 16; i++) {
      const quiz = selectDailyQuestions(bank, addDays("2026-09-01", i));
      expect(quiz.filter((q) => q.difficulty === "vaikea")).toHaveLength(1);
    }
  });
  it("is independent of bank order and leaves input untouched", () => {
    const before = JSON.stringify(bank);
    expect(selectDailyQuestions([...bank].reverse(), "2026-09-11")).toEqual(
      selectDailyQuestions(bank, "2026-09-11"),
    );
    expect(JSON.stringify(bank)).toBe(before);
  });
  it("balances categories and difficulties when the available deck permits", () => {
    const quiz = selectDailyQuestions(bank, "2026-09-01");
    expect(new Set(quiz.map((q) => q.category)).size).toBe(7);
    expect(new Set(quiz.map((q) => q.difficulty)).size).toBe(3);
  });
  it("supports a configured quiz length and rejects impossible requests", () => {
    expect(
      selectDailyQuestions(bank, "2026-09-11", { length: 5 }),
    ).toHaveLength(5);
    expect(() =>
      selectDailyQuestions(bank.slice(0, 2), "2026-09-11"),
    ).toThrow();
    expect(() =>
      selectDailyQuestions(bank, "2026-09-11", { length: 0 }),
    ).toThrow();
  });
  it("excludes review, retired, future and expired questions", () => {
    expect(isEligible({ ...bank[0], status: "review" }, "2026-09-11")).toBe(
      false,
    );
    expect(isEligible({ ...bank[0], status: "retired" }, "2026-09-11")).toBe(
      false,
    );
    expect(
      isEligible({ ...bank[0], validFrom: "2026-09-12" }, "2026-09-11"),
    ).toBe(false);
    expect(
      isEligible({ ...bank[0], validUntil: "2026-09-10" }, "2026-09-11"),
    ).toBe(false);
    expect(
      isEligible(
        { ...bank[0], validFrom: "2026-09-11", validUntil: "2026-09-11" },
        "2026-09-11",
      ),
    ).toBe(true);
    const changed = bank.map((q, i) =>
      i < 4 ? { ...q, validUntil: "2026-08-31" } : q,
    );
    expect(
      selectDailyQuestions(changed, "2026-09-11").every(
        (q) => !changed.slice(0, 4).some((c) => c.id === q.id),
      ),
    ).toBe(true);
  });
});
describe("conservative answer matching and scores", () => {
  const kekkonen = bank.find((q) => q.id === "suomi-kekkonen")!;
  it.each([
    "Kekkonen",
    "  URHO   KEKKONEN! ",
    "Urho\nKekkonen",
    "Urho Kaleva Kekkonen",
  ])("accepts an explicit alias: %s", (input) =>
    expect(matchAnswer(kekkonen, input)?.points).toBe(30),
  );
  it.each([
    "Kekonen",
    "Urho",
    "Koivisto",
    "ei Kekkonen",
    "",
    "  ",
    "Kekkonen tai Koivisto",
  ])("rejects incorrect or vague answers: %s", (input) =>
    expect(matchAnswer(kekkonen, input)).toBeUndefined(),
  );
  it("normalizes Unicode without discarding Finnish letters", () => {
    expect(normalizeAnswer("A\u0308a\u0308ni")).toBe("ääni");
    expect(normalizeAnswer("Ääni")).not.toBe(normalizeAnswer("Aani"));
    expect(normalizeAnswer("ＡＢＢＡ")).toBe("abba");
    expect(normalizeAnswer("Länsi–Saksa")).toBe("länsi saksa");
    expect(normalizeAnswer("42,195")).toBe(normalizeAnswer("42.195"));
    expect(normalizeAnswer("-1827")).not.toBe(normalizeAnswer("1827"));
    expect(normalizeAnswer("−1827")).toBe("-1827");
    expect(normalizeAnswer("42.195")).not.toBe(normalizeAnswer("42195"));
  });
  it("awards individual tiers and maximums for multiple valid answers", () => {
    const q = bank.find((q) => q.id === "yhteiskunta-rooman-sopimus")!;
    expect(evaluateAnswer(q, "Ranska").points).toBe(20);
    expect(evaluateAnswer(q, "Luxembourg").points).toBe(100);
    expect(evaluateAnswer(q, "Suomi").points).toBe(0);
    expect(evaluateAnswer(q, "Ranska").maxPoints).toBe(100);
  });
  it("supports answer-specific explanations and unscored practice", () => {
    const q = {
      ...kekkonen,
      answers: [
        { ...kekkonen.answers[0], explanation: "Erillinen perustelu." },
      ],
    };
    expect(evaluateAnswer(q, "Kekkonen").explanation).toBe(
      "Erillinen perustelu.",
    );
    expect(evaluateAnswer(q, "Kekkonen", false)).toMatchObject({
      accepted: true,
      points: 0,
      maxPoints: 0,
    });
  });
  it("sums correct answers and possible points, including wrong answers", () => {
    expect(
      totalScore([
        evaluateAnswer(kekkonen, "Kekkonen"),
        evaluateAnswer(kekkonen, ""),
      ]),
    ).toEqual({ points: 30, maxPoints: 60, correct: 1 });
  });
});
describe("seed bank and maintenance validation", () => {
  it("contains 112 valid original records, all categories and point tiers", () => {
    const result = validateBank(releases[0].questions, "2026-09-11");
    expect(result.issues).toEqual([]);
    expect(bank).toHaveLength(112);
    expect(new Set(bank.map((q) => q.category)).size).toBe(
      Object.keys(CATEGORIES).length,
    );
    expect(
      [...new Set(bank.flatMap((q) => q.answers.map((a) => a.points)))].sort(
        (a, b) => a - b,
      ),
    ).toEqual([...SCORE_TIERS]);
  });
  it("detects duplicate IDs and text", () => {
    const { issues } = validateBank([...bank, bank[0]]);
    expect(
      issues.some((i) => i.message.includes("Duplicate question ID")),
    ).toBe(true);
    expect(
      issues.some((i) => i.message.includes("Duplicate question text")),
    ).toBe(true);
  });
  it("detects aliases that resolve to different answers", () => {
    const q = {
      ...bank[0],
      answers: [
        ...bank[0].answers,
        { canonical: "Testi", points: 50, aliases: ["Kekkonen"] },
      ],
    };
    expect(
      validateBank([q]).issues.some(
        (i) => i.severity === "error" && i.message.includes("alias collision"),
      ),
    ).toBe(true);
  });
  it.each([
    { answers: [] },
    { answers: [{ canonical: "Testi", points: 15, aliases: [] }] },
    { validUntil: "2026-02-30" },
    { evergreen: false },
    { question: "" },
    { category: "unknown" },
    { unexpected: true },
    { validFrom: "2026-10-01", validUntil: "2026-09-01" },
  ])("rejects malformed records: %j", (change) =>
    expect(questionSchema.safeParse({ ...bank[0], ...change }).success).toBe(
      false,
    ),
  );
  it("reports expired questions and missing categories", () => {
    const issues = validateBank(
      [{ ...bank[0], validUntil: "2026-09-01" }],
      "2026-09-11",
    ).issues;
    expect(issues.some((i) => i.message.includes("Expired"))).toBe(true);
    expect(
      issues.some((i) => i.message.includes("Missing active category")),
    ).toBe(true);
  });
  it("detects near-identical text as editorial warnings", () => {
    const q = {
      ...bank[0],
      id: "test-duplicate",
      question: bank[0].question + " Suomessa",
    };
    expect(
      validateBank([...bank, q]).issues.some((i) =>
        i.message.includes("Near-identical"),
      ),
    ).toBe(true);
  });
});
