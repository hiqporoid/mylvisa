import type { QuizResponse } from "@/lib/quiz/contracts";
import { formatDate } from "@/lib/quiz/date";
export function shareText(game: QuizResponse): string {
  if (!game.summary || game.mode !== "daily") return "";
  const marks = game.results
    .map((r) => (!r.accepted ? "·" : r.points === r.maxPoints ? "✦" : "✧"))
    .join(" ");
  return `Mylvisa · ${formatDate(game.date)}\n${marks}\n${game.summary.points}/${game.summary.maxPoints} pistettä · ${game.summary.correct}/${game.length} oikein\nPieni visa. Avara maailma.`;
}
