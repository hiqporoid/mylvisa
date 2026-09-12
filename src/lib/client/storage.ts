import { MAX_ANSWER_LENGTH } from "@/lib/quiz/catalog";
import type { QuizResponse } from "@/lib/quiz/contracts";

export const STORAGE_PREFIX = "mylvisa:v2:";
export type SavedGame = {
  version: 2;
  date: string;
  releaseId?: string;
  answers: string[];
  started: boolean;
  feedback: boolean;
  roundStartedAt?: string;
  result?: QuizResponse;
};

export function readGame(date: string): SavedGame | null {
  const raw = localStorage.getItem(STORAGE_PREFIX + date);
  if (!raw) return null;
  try {
    const value = JSON.parse(raw) as Partial<SavedGame>;
    if (
      value.version !== 2 || value.date !== date || !Array.isArray(value.answers) ||
      value.answers.length > 30 || value.answers.some((answer) => typeof answer !== "string" || answer.length > MAX_ANSWER_LENGTH) ||
      typeof value.started !== "boolean" || typeof value.feedback !== "boolean" ||
      (value.roundStartedAt !== undefined && typeof value.roundStartedAt !== "string")
    ) return null;
    return {
      version: 2,
      date,
      ...(typeof value.releaseId === "string" ? { releaseId: value.releaseId } : {}),
      answers: value.answers,
      started: value.started,
      feedback: value.feedback,
      ...(value.roundStartedAt ? { roundStartedAt: value.roundStartedAt } : {}),
      ...(value.result ? { result: value.result } : {}),
    };
  } catch {
    return null;
  }
}

export function saveGame(game: SavedGame): boolean {
  try {
    const previous = readGame(game.date);
    const previousRelease = previous?.releaseId ?? previous?.result?.releaseId;
    if (previous && previousRelease !== game.releaseId) {
      localStorage.setItem(`mylvisa:archive:${game.date}:${previousRelease ?? "legacy"}`, JSON.stringify(previous));
    }
    localStorage.setItem(STORAGE_PREFIX + game.date, JSON.stringify(game));
    return true;
  } catch {
    return false;
  }
}
