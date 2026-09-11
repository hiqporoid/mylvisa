import type { Category } from "./catalog";
export type Mode = "daily" | "practice";
export type PublicQuestion = {
  id: string;
  question: string;
  category: Category;
  number: number;
};
export type AnswerResult = {
  id: string;
  question: string;
  category: Category;
  answer: string;
  accepted: boolean;
  canonicalAnswer: string;
  points: number;
  maxPoints: number;
  explanation: string;
};
export type QuizResponse = {
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
};
