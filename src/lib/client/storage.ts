import { MAX_ANSWER_LENGTH } from "@/lib/quiz/catalog";
import type { QuizResponse } from "@/lib/quiz/contracts";
export const STORAGE_PREFIX = "mylvisa:v1:";
export type SavedGame = {
  version: 1;
  date: string;
  answers: string[];
  started: boolean;
  feedback: boolean;
  result?: QuizResponse;
};
export function readGame(date: string): SavedGame | null {
  const raw = localStorage.getItem(STORAGE_PREFIX + date);
  if (!raw) return null;
  try {
    const value = JSON.parse(raw) as Partial<SavedGame>;
    if (
      value.version !== 1 ||
      value.date !== date ||
      !Array.isArray(value.answers) ||
      value.answers.length > 30 ||
      value.answers.some(
        (a) => typeof a !== "string" || a.length > MAX_ANSWER_LENGTH,
      ) ||
      typeof value.started !== "boolean" ||
      typeof value.feedback !== "boolean"
    )
      return null;
    return {
      version: 1,
      date,
      answers: value.answers,
      started: value.started,
      feedback: value.feedback,
    };
  } catch {
    return null;
  }
}
export function saveGame(game: SavedGame): boolean {
  try {
    localStorage.setItem(STORAGE_PREFIX + game.date, JSON.stringify(game));
    return true;
  } catch {
    return false;
  }
}
