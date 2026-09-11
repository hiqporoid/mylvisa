import type { QuizResponse } from "@/lib/quiz/contracts";
import { formatDate } from "@/lib/quiz/date";

function bar(points: number): string {
  const filled = Math.max(0, Math.min(5, Math.round(points / 20)));
  return "▰".repeat(filled) + "▱".repeat(5 - filled);
}

export function shareText(game: QuizResponse): string {
  if (!game.summary || game.mode !== "daily") return "";
  const rows = game.results.map((result, index) => `${String(index + 1).padStart(2, "0")} ${bar(result.points)} ${result.points}`);
  return [
    `MYLVISA · ${formatDate(game.date)}`,
    `${game.summary.points} / ${game.summary.maxPoints}`,
    ...rows,
    `${game.summary.correct} / ${game.length} hyväksyttyä vastausta`,
  ].join("\n");
}
