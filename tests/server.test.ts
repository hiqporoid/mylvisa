import { describe, expect, it } from "vitest";
import { GET, POST } from "@/app/api/quiz/route";
import { getDailyQuiz } from "@/lib/server/bank";
import { play } from "@/lib/server/game";
import { helsinkiDate } from "@/lib/quiz/date";
import { shareText } from "@/lib/client/share";
const now = new Date("2026-09-11T10:00:00Z");
const input = { date: "2026-09-11", mode: "daily", answers: [] };
describe("server boundary and full game", () => {
  it("preserves the published deck-v1 fixture", () => {
    expect(getDailyQuiz("2026-09-11").questions.map(q => q.id)).toEqual([
      "teknologia-transistori", "tiede-avogadro", "urheilu-maraton", "kieli-essiivi",
      "suomi-saimaa", "yhteiskunta-eduskunta", "maantiede-paivantasaja",
    ]);
  });
  it("exposes only current display fields before submission", () => {
    const game = play(input, now);
    expect(game.results).toEqual([]);
    expect(game.summary).toBeNull();
    expect(Object.keys(game.current!).sort()).toEqual([
      "category",
      "id",
      "number",
      "question",
    ]);
    for (const key of [
      "answers",
      "canonicalAnswer",
      "points",
      "maxPoints",
      "explanation",
      "difficulty",
      "sources",
    ])
      expect(JSON.stringify(game)).not.toContain(`"${key}"`);
  });
  it("provides feedback only for submitted positions and calculates the full result", () => {
    const questions = getDailyQuiz(input.date).questions;
    const answers = questions.map((q) => q.answers[0].canonical);
    for (let i = 1; i <= 7; i++) {
      const game = play({ ...input, answers: answers.slice(0, i) }, now);
      expect(game.results).toHaveLength(i);
      expect(game.results.every((r) => r.accepted)).toBe(true);
      expect(JSON.stringify(game)).not.toContain('"aliases"');
      if (i < 7) {
        expect(game.current?.number).toBe(i + 1);
        expect(game.summary).toBeNull();
      } else {
        expect(game.current).toBeNull();
        expect(game.summary?.correct).toBe(7);
      }
    }
  });
  it("rejects stale daily dates, future practice and tampered payloads", () => {
    expect(() => play({ ...input, date: "2026-09-10" }, now)).toThrow(
      "Päivä vaihtui",
    );
    expect(() => play({ ...input, mode: "practice" }, now)).toThrow();
    expect(() =>
      play({ ...input, date: "2026-09-12", mode: "practice" }, now),
    ).toThrow();
    expect(() => play({ ...input, score: 10000 }, now)).toThrow();
    expect(() => play({ ...input, answers: Array(8).fill("") }, now)).toThrow();
    expect(() => play({ ...input, answers: ["x".repeat(161)] }, now)).toThrow();
    expect(() => play({ ...input, releaseId: "forged" }, now)).toThrow();
  });
  it("keeps practice unscored and sharing answer-free", () => {
    const practice = play(
      { date: "2026-09-10", mode: "practice", answers: Array(7).fill("") },
      now,
    );
    expect(practice.summary).toEqual({ points: 0, maxPoints: 0, correct: 0 });
    expect(shareText(practice)).toBe("");
    const game = play(
      {
        ...input,
        answers: getDailyQuiz(input.date).questions.map(
          (q) => q.answers[0].canonical,
        ),
      },
      now,
    );
    const text = shareText(game);
    expect(text).toContain("Mylvisa · 11.9.2026");
    expect(text).toContain("7/7 oikein");
    for (const result of game.results) {
      expect(text).not.toContain(result.question);
      expect(text).not.toContain(result.canonicalAnswer);
    }
  });
});
describe("HTTP protection", () => {
  const req = (body: string, headers: Record<string, string> = {}) =>
    new Request("http://localhost:3000/api/quiz", {
      method: "POST",
      headers: { "Content-Type": "application/json", ...headers },
      body,
    });
  it("never caches a question or feedback response", async () => {
    const response = await GET();
    expect(response.status).toBe(200);
    expect(response.headers.get("cache-control")).toContain("no-store");
  });
  it("rejects cross-origin, malformed, wrong-type and oversized requests", async () => {
    expect(
      (await POST(req("{}", { origin: "https://example.com" }))).status,
    ).toBe(403);
    expect((await POST(req("{"))).status).toBe(400);
    expect(
      (await POST(req("{}", { "Content-Type": "text/plain" }))).status,
    ).toBe(415);
    expect((await POST(req(" ".repeat(24_001)))).status).toBe(413);
  });
  it("validates the incoming host behind an internal Next.js URL", async () => {
    const body = JSON.stringify({ date: helsinkiDate(), mode: "daily", answers: [] });
    expect((await POST(req(body, { host: "127.0.0.1:3000", origin: "http://127.0.0.1:3000" }))).status).toBe(200);
    expect((await POST(req(body, { host: "127.0.0.1:3000", origin: "http://attacker.example" }))).status).toBe(403);
  });
  it("scores actual HTTP submissions on the server", async () => {
    const date = helsinkiDate();
    const question = getDailyQuiz(date).questions[0];
    const response = await POST(
      req(
        JSON.stringify({
          date,
          mode: "daily",
          answers: [question.answers[0].canonical],
        }),
        { origin: "http://localhost:3000" },
      ),
    );
    expect(response.status).toBe(200);
    const game = await response.json();
    expect(game.results[0].accepted).toBe(true);
    expect(game.current.number).toBe(2);
  });
});
