import type { Category } from "./catalog";
export type Mode = "daily" | "practice";
export type AnswerOutcome = "accepted" | "timeout" | "skipped" | "legacy-invalid";
export type Resolution =
  | { status: "invalid"; message: string }
  | { status: "confirm"; canonicalAnswer: string; confirmationToken: string }
  | { status: "accepted"; canonicalAnswer: string }
  | { status: "timeout" }
  | { status: "skipped" };
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
  originalAnswer?: string;
  accepted: boolean;
  canonicalAnswer?: string;
  canonicalized?: boolean;
  outcome: AnswerOutcome;
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
  resolution?: Resolution;
  date: string;
  today: string;
  mode: Mode;
  releaseId: string;
  length: number;
  serverNow: string;
  nextRollover: string;
  results: AnswerResult[];
  current: PublicQuestion | null;
  summary: { points: number; maxPoints: number; correct: number; placement?: number } | null;
};
export type LocalRoundOutcome = "answer" | "timeout" | "skipped";
export type QuizAttempt =
  | { action: "answer"; answer: string }
  | { action: "confirm"; confirmationToken: string }
  | { action: "timeout" }
  | { action: "skip" };
export type QuizRequest = {
  date: string;
  mode: Mode;
  answers: string[];
  outcomes?: LocalRoundOutcome[];
  attempt?: QuizAttempt;
  releaseId?: string;
  roundStartedAt?: string;
};
