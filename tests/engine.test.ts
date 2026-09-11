import { describe, expect, it } from "vitest";
import { releases } from "@/data/releases";
import { FIRST_QUIZ_DATE, SCORE_TIERS } from "@/lib/quiz/catalog";
import { addDays, helsinkiDate, isDateKey, nextMidnight } from "@/lib/quiz/date";
import { normalizeAnswer } from "@/lib/quiz/normalize";
import { questionSchema } from "@/lib/quiz/schema";
import { evaluateAnswer, matchAnswer, totalScore } from "@/lib/quiz/score";
import { isEligible, selectDailyQuestions } from "@/lib/quiz/selection";
import { createRoundClock, remainingSeconds, roundStatus } from "@/lib/quiz/timer";
import { validateBank } from "@/lib/quiz/validate";
import { universeById } from "@/data/universes";

const bank = releases[0].questions.map((question) => questionSchema.parse(question));
const ids = (date: string) => selectDailyQuestions(bank, date).map((question) => question.id);

describe("Helsingin kalenteri ja kierroskello", () => {
  it("uses Europe/Helsinki and rolls at midnight", () => {
    expect(helsinkiDate(new Date("2026-09-11T20:59:59.999Z"))).toBe("2026-09-11");
    expect(helsinkiDate(new Date("2026-09-11T21:00:00Z"))).toBe("2026-09-12");
    expect(helsinkiDate(new Date("2026-01-10T21:59:59Z"))).toBe("2026-01-10");
    expect(helsinkiDate(new Date("2026-01-10T22:00:00Z"))).toBe("2026-01-11");
    expect(nextMidnight(new Date("2026-09-11T21:00:00Z")).toISOString()).toBe("2026-09-12T21:00:00.000Z");
    expect(isDateKey("2026-02-29")).toBe(false);
    expect(addDays("2026-12-31", 1)).toBe("2027-01-01");
  });

  it("has a three-second preview and 25-second absolute deadline", () => {
    const clock = createRoundClock(1_000);
    expect(roundStatus(clock, 3_999)).toBe("preview");
    expect(roundStatus(clock, 4_000)).toBe("answering");
    expect(remainingSeconds(clock, 4_001)).toBe(25);
    expect(remainingSeconds(clock, 29_001)).toBe(0);
    expect(roundStatus(clock, 29_000)).toBe("expired");
    expect(roundStatus(clock, 60_000)).toBe("expired");
  });
});

describe("deterministinen päiväpeli", () => {
  it("same Finnish date has same ordered game and adjacent dates differ", () => {
    expect(ids("2026-09-12")).toEqual(ids("2026-09-12"));
    expect(ids("2026-09-12")).not.toEqual(ids("2026-09-13"));
  });

  it("does not duplicate questions or universes and varies categories", () => {
    const quiz = selectDailyQuestions(bank, "2026-09-12");
    expect(new Set(quiz.map((question) => question.id)).size).toBe(7);
    expect(new Set(quiz.map((question) => question.universeId)).size).toBe(7);
    expect(new Set(quiz.map((question) => question.category)).size).toBeGreaterThanOrEqual(2);
  });

  it("consumes the daily bank without repeats for one full cycle", () => {
    const cycleDays = Math.floor(bank.filter((question) => question.dailyEligible).length / 7);
    const all = Array.from({ length: cycleDays }, (_, index) => ids(addDays(FIRST_QUIZ_DATE, index))).flat();
    expect(new Set(all).size).toBe(cycleDays * 7);
  });

  it("is independent of input order and excludes inactive records", () => {
    expect(ids("2026-09-15")).toEqual(selectDailyQuestions([...bank].reverse(), "2026-09-15").map((question) => question.id));
    expect(isEligible({ ...bank[0], status: "retired" }, "2026-09-12")).toBe(false);
    expect(isEligible({ ...bank[0], validUntil: "2026-09-11" }, "2026-09-12")).toBe(false);
  });
});

describe("vastausten konservatiivinen normalisointi ja rarity-pisteet", () => {
  it("preserves Finnish characters and harmless punctuation differences", () => {
    expect(normalizeAnswer("  PÄIVÄ   ")).toBe("päivä");
    expect(normalizeAnswer("ＡＢＢＡ")).toBe("abba");
    expect(normalizeAnswer("Länsi–Saksa")).toBe("länsi saksa");
    expect(normalizeAnswer("Ääni")).not.toBe(normalizeAnswer("Aani"));
  });

  it("maps aliases and a unique adjacent transposition", () => {
    const president = bank.find((item) => item.id === "suomi-presidentit")!;
    expect(matchAnswer(president, "Kekkonen")?.canonical).toBe("Urho Kekkonen");
    const question = { ...bank[0], answers: [{ ...bank[0].answers[0], aliases: ["Ensimmäinen nimi"] }, ...bank[0].answers.slice(1)] };
    expect(matchAnswer(question, "ensimmäinen nimi")?.canonical).toBe(question.answers[0].canonical);
    const transposition = { ...question, answers: [{ ...question.answers[0], canonical: "Ranska", aliases: [] }, ...question.answers.slice(1)] };
    expect(matchAnswer(transposition, "Ransak")?.canonical).toBe("Ranska");
  });

  it("rejects an ambiguous typo", () => {
    const question = { ...bank[0], answers: [{ ...bank[0].answers[0], canonical: "acb", aliases: [] }, { ...bank[0].answers[1], canonical: "bac", aliases: [] }, ...bank[0].answers.slice(2)] };
    expect(matchAnswer(question, "abc")).toBeUndefined();
  });

  it("awards the same valid set different tiers and only supported scores", () => {
    const question = bank.find((item) => item.id === "maantiede-itameri")!;
    const low = evaluateAnswer(question, "Suomi");
    const rare = evaluateAnswer(question, "Venäjä");
    expect(low.accepted).toBe(true);
    expect(rare.accepted).toBe(true);
    expect(low.points).not.toBe(rare.points);
    expect([...SCORE_TIERS]).toContain(low.points);
    expect([...SCORE_TIERS]).toContain(rare.points);
    expect(totalScore([low, evaluateAnswer(question, "ei tämä")])).toMatchObject({ points: low.points, correct: 1, maxPoints: 200 });
  });

  it("derives the runtime maximum from the answer set", () => {
    const question = bank.find((item) => item.dailyEligible)!;
    const malformed = { ...question, answers: question.answers.map((answer) => ({ ...answer, points: 85 as const, tier: "Syvä tieto" as const, editorialTier: "85" as const, effectiveTier: "85" as const })) };
    expect(evaluateAnswer(malformed, "not in the set").maxPoints).toBe(85);
  });
});

describe("pankin rakenne", () => {
  it("contains a verified daily bank with broad rarity spread", () => {
    const result = validateBank(releases[0].questions, "2026-09-12");
    expect(result.issues.filter((issue) => issue.severity === "error")).toEqual([]);
    expect(result.questions.length).toBeGreaterThan(100);
    expect(result.quality.dailyEligibleQuestionCount).toBeGreaterThanOrEqual(7);
    expect(new Set(result.questions.map((question) => question.category)).size).toBeGreaterThanOrEqual(8);
    expect(result.quality.medianAnswers).toBeGreaterThanOrEqual(5);
    expect(result.quality.points["10"]).toBeGreaterThan(0);
    expect(result.quality.points["100"]).toBeGreaterThan(0);
    expect(result.quality.max100QuestionCount).toBeGreaterThan(0);
  });

  it("keeps completeness, review and membership metadata separate from scores", () => {
    for (const question of bank) {
      const universe = universeById.get(question.universeId)!;
      expect(question.completeness.source).toBe(universe.source.url);
      expect(question.completeness.status).toBe("verified");
      expect(question.answers).toHaveLength(universe.expectedCount);
      expect(new Set(question.answers.map((answer) => answer.canonical)).size).toBe(universe.expectedCount);
      for (const answer of question.answers) expect(matchAnswer(question, answer.canonical)?.canonical).toBe(answer.canonical);
      if (question.dailyEligible) {
        expect(question.contentReview).toBe("verified");
        expect(question.rarityReview).toBe("editorial-reviewed");
        expect(question.accessibilityReview).toBe("verified");
        expect(question.accessibility).toBeGreaterThanOrEqual(4);
        expect(Math.max(...question.answers.map((answer) => answer.points))).toBe(100);
        expect(question.answers.some((answer) => answer.points === 10 || answer.points === 15)).toBe(true);
      }
    }
    const presidents = bank.find((question) => question.id === "suomi-presidentit")!;
    expect(presidents.answers.find((answer) => answer.canonical === "Urho Kekkonen")?.points).toBe(10);
    expect(presidents.answers.find((answer) => answer.canonical === "Risto Ryti")?.points).toBe(60);
    expect(presidents.answers.find((answer) => answer.canonical === "Carl Gustaf Emil Mannerheim")?.points).toBe(15);
  });

  it("rejects a truncated verified universe", () => {
    const parks = bank.find((question) => question.id === "suomi-kansallispuistot")!;
    const truncated = { ...parks, answers: parks.answers.slice(0, -1) };
    const result = validateBank([truncated]);
    expect(result.issues.some((item) => item.message.includes("canonical answers"))).toBe(true);
    expect(result.issues.some((item) => item.message.includes("equal the verified universe"))).toBe(true);
  });

  it("catches malformed rarity records", () => {
    expect(questionSchema.safeParse({ ...bank[0], answers: [] }).success).toBe(false);
    expect(questionSchema.safeParse({ ...bank[0], answers: bank[0].answers.map((answer) => ({ ...answer, points: 20 })) }).success).toBe(false);
    expect(validateBank([...bank, bank[0]]).issues.some((issue) => issue.message.includes("Duplicate question ID"))).toBe(true);
  });

  it("rejects a daily question without a reachable 100-point answer", () => {
    const source = bank.find((question) => question.dailyEligible)!;
    const malformed = {
      ...source,
      answers: source.answers.map((answer) => ({ ...answer, points: answer.points === 100 ? 85 : answer.points, editorialTier: answer.points === 100 ? "85" : answer.editorialTier, effectiveTier: answer.points === 100 ? "85" : answer.effectiveTier, tier: answer.points === 100 ? "Syvä tieto" : answer.tier })),
    };
    const result = validateBank([malformed]);
    expect(result.issues.some((issue) => issue.message.includes("max score must be 100"))).toBe(true);
  });

  it("keeps the max score invariant true for every seven-round daily deck", () => {
    for (let day = 0; day < 30; day++) {
      const quiz = selectDailyQuestions(bank, addDays(FIRST_QUIZ_DATE, day));
      expect(quiz).toHaveLength(7);
      expect(quiz.reduce((sum, question) => sum + Math.max(...question.answers.map((answer) => answer.points)), 0)).toBe(700);
    }
  });
});
