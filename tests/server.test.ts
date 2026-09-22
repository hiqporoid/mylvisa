import { describe, expect, it } from "vitest";
import { GET, POST } from "@/app/api/quiz/route";
import { getDailyQuiz } from "@/lib/server/bank";
import { play } from "@/lib/server/game";
import { helsinkiDate } from "@/lib/quiz/date";
import { shareText } from "@/lib/client/share";

const date = "2026-09-12";
const now = new Date("2026-09-12T10:00:00Z");
const input = { date, mode: "daily" as const, answers: [] as string[] };

describe("server boundary and rarity game", () => {
  it("exposes only the current prompt before submission", () => {
    const game = play(input, now);
    expect(game.results).toEqual([]);
    expect(game.summary).toBeNull();
    expect(Object.keys(game.current!).sort()).toEqual(["category", "id", "number", "prompt", "universeId"]);
    expect(JSON.stringify(game)).not.toContain("canonical");
    expect(JSON.stringify(game)).not.toContain("aliases");
    expect(JSON.stringify(game)).not.toContain("referenceDefinition");
  });

  it("validates each submitted answer server-side and gives feedback only for it", () => {
    const questions = getDailyQuiz(date).questions;
    const expected = questions[0].answers.find((answer) => answer.points === 10 || answer.points === 15)!;
    const started = new Date(now.getTime() - 4_000).toISOString();
    const first = play({ ...input, roundStartedAt: started, attempt: { action: "answer", answer: expected.canonical } }, now);
    expect(first.results).toHaveLength(1);
    expect(first.results[0].accepted).toBe(true);
    expect(first.results[0].points).toBe(expected.points);
    expect(first.current?.number).toBe(2);
    expect(JSON.stringify(first)).not.toContain("aliases");
  });

  it("keeps an invalid attempt non-terminal and reveals no candidate", () => {
    const started = new Date(now.getTime() - 4_000).toISOString();
    const game = play({ ...input, roundStartedAt: started, attempt: { action: "answer", answer: "tämä ei ole hyväksytty" } }, now);
    expect(game.results).toEqual([]);
    expect(game.current?.number).toBe(1);
    expect(game.resolution).toEqual({ status: "invalid", message: "Ei osumaa, kokeile uudelleen." });
    expect(JSON.stringify(game)).not.toContain("canonicalAnswer");
  });

  it("forces a late submission to timeout using the absolute deadline", () => {
    const started = new Date(now.getTime() - 29_000).toISOString();
    const game = play({ ...input, roundStartedAt: started, attempt: { action: "timeout" } }, now);
    expect(game.results[0]).toMatchObject({ accepted: false, points: 0, answer: "", outcome: "timeout" });
  });

  it("returns a seven-round maximum of 700 points", () => {
    const questions = getDailyQuiz(date).questions;
    const game = play({ ...input, answers: questions.map((question) => question.answers.find((answer) => answer.points === 100)!.canonical) }, now);
    expect(game.summary).toEqual({ points: 700, maxPoints: 700, correct: 7 });
  });

  it("never trusts a client-supplied completion history to disclose answer universes", () => {
    const questions = getDailyQuiz(date).questions;
    const partial = play({ ...input, answers: questions.slice(0, 6).map((question) => question.answers[0].canonical) }, now);
    expect(partial.results.every((result) => !result.correctAnswers)).toBe(true);
    const complete = play({ ...input, answers: questions.map((question) => question.answers[0].canonical) }, now);
    expect(complete.results).toHaveLength(7);
    for (const [index, result] of complete.results.entries()) {
      expect(result.correctAnswers).toBeUndefined();
      expect(result.id).toBe(questions[index].id);
    }
  });

  it("rejects stale, future and tampered requests", () => {
    expect(() => play({ ...input, date: "2026-09-11" }, now)).toThrow("Päivä vaihtui");
    expect(() => play({ ...input, date: "2026-09-13", mode: "practice" }, now)).toThrow();
    expect(() => play({ ...input, score: 10000 }, now)).toThrow();
    expect(() => play({ ...input, answers: Array(8).fill("") }, now)).toThrow();
    expect(() => play({ ...input, answers: ["x".repeat(161)] }, now)).toThrow();
    expect(() => play({ ...input, releaseId: "forged" }, now)).toThrow();
  });

  it("keeps practice unscored and share text answer-free", () => {
    const practice = play({ date: "2026-09-11", mode: "practice", answers: Array(7).fill("") }, now);
    expect(practice.summary).toEqual({ points: 0, maxPoints: 0, correct: 0 });
    expect(shareText(practice)).toBe("");
    const game = play({ ...input, answers: getDailyQuiz(date).questions.map((question) => question.answers[0].canonical) }, now);
    const shared = shareText(game);
    expect(shared).toContain("MYLVISA");
    expect(shared).not.toContain(game.results[0].canonicalAnswer!);
    expect(shared).not.toContain(game.results[0].prompt);
  });
});

describe("HTTP protection", () => {
  const req = (body: string, headers: Record<string, string> = {}) => new Request("http://localhost:3000/api/quiz", { method: "POST", headers: { "Content-Type": "application/json", ...headers }, body });
  it("never caches responses and rejects malformed or cross-origin input", async () => {
    expect((await GET()).headers.get("cache-control")).toContain("no-store");
    expect((await POST(req("{}", { origin: "https://example.com" }))).status).toBe(403);
    expect((await POST(req("{"))).status).toBe(400);
    expect((await POST(req("{}", { "Content-Type": "text/plain" }))).status).toBe(415);
    expect((await POST(req("x".repeat(24_001)))).status).toBe(413);
  });
  it("accepts a real same-origin answer request", async () => {
    const body = JSON.stringify({ date: helsinkiDate(), mode: "daily", answers: [] });
    expect((await POST(req(body, { host: "127.0.0.1:3000", origin: "http://127.0.0.1:3000" }))).status).toBe(200);
  });
});
