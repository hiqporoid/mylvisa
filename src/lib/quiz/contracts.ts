import type { Category } from "./catalog";
export type Mode = "daily" | "practice";
export type PublicQuestion = {
  id: string;
  prompt: string;
  category: Category;
  number: number;
  universeId: string;
};
export type AnswerResult = {
  id: string;
  prompt: string;
  category: Category;
  answer: string;
  accepted: boolean;
  canonicalAnswer?: string;
  points: number;
  maxPoints: number;
  tier?: string;
  rarityRank: number;
  explanation: string;
};
export type QuizResponse = {
  persistence?: "saved" | "local";
  supportsPersistence?: boolean;
  runVersion?: number;
  runStatus?: "answering" | "feedback" | "completed";
  roundStartedAt?: string | null;
  date: string;
  today: string;
  mode: Mode;
  releaseId: string;
  length: number;
  serverNow: string;
  nextRollover: string;
  results: AnswerResult[];
  current: PublicQuestion | null;
  summary: { points: number; maxPoints: number; correct: number } | null;
};
export type QuizRequest = {
  date: string;
  mode: Mode;
  answers: string[];
  releaseId?: string;
  roundStartedAt?: string;
};
