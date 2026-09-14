import "server-only";
import { createCipheriv, createDecipheriv, createHash, randomBytes } from "node:crypto";
import { z } from "zod";
import { normalizeAnswer } from "@/lib/quiz/normalize";
import { matchAnswer } from "@/lib/quiz/score";
import type { Question } from "@/lib/quiz/schema";

const tokenPayload = z.strictObject({
  version: z.literal(1),
  runId: z.string().min(1).max(200),
  userId: z.string().min(1).max(200),
  questionId: z.string().min(1).max(120),
  runVersion: z.number().int().nonnegative(),
  normalizedInput: z.string().min(1).max(160),
  originalInput: z.string().min(1).max(160),
  canonicalEntityId: z.string().min(1).max(128),
  expiresAt: z.number().int().positive(),
});

export type ConfirmationPayload = z.infer<typeof tokenPayload>;
export type AnswerResolution =
  | { status: "accepted"; answer: Question["answers"][number] }
  | { status: "confirm"; answer: Question["answers"][number]; normalizedInput: string; originalInput: string }
  | { status: "invalid" };

export function canonicalEntityId(question: Question, canonical: string) {
  return createHash("sha256").update(`${question.baseUniverseId ?? question.universeId}\0${canonical.normalize("NFC")}`).digest("hex");
}

function key(secret: string) {
  return createHash("sha256").update("mylvisa-answer-confirmation-v1\0").update(secret).digest();
}

export function confirmationSecret() {
  const secret = process.env.ANSWER_CONFIRMATION_SECRET ?? process.env.SUPABASE_SECRET_KEY;
  if (secret) return secret;
  if (process.env.NODE_ENV === "production") throw new Error("ANSWER_CONFIRMATION_SECRET is not configured");
  return "mylvisa-local-development-confirmation-secret";
}

export function createConfirmationToken(payload: ConfirmationPayload, secret = confirmationSecret()) {
  const parsed = tokenPayload.parse(payload);
  const nonce = randomBytes(12);
  const cipher = createCipheriv("aes-256-gcm", key(secret), nonce);
  const encrypted = Buffer.concat([cipher.update(JSON.stringify(parsed), "utf8"), cipher.final()]);
  return Buffer.concat([nonce, cipher.getAuthTag(), encrypted]).toString("base64url");
}

export function readConfirmationToken(token: string, secret = confirmationSecret()): ConfirmationPayload | null {
  try {
    const bytes = Buffer.from(token, "base64url");
    if (bytes.length < 29 || bytes.length > 1024) return null;
    const nonce = bytes.subarray(0, 12);
    const tag = bytes.subarray(12, 28);
    const decipher = createDecipheriv("aes-256-gcm", key(secret), nonce);
    decipher.setAuthTag(tag);
    const decoded = Buffer.concat([decipher.update(bytes.subarray(28)), decipher.final()]).toString("utf8");
    const parsed = tokenPayload.safeParse(JSON.parse(decoded));
    return parsed.success ? parsed.data : null;
  } catch {
    return null;
  }
}

export function resolveAnswer(question: Question, input: string): AnswerResolution {
  const direct = matchAnswer(question, input);
  if (direct) return { status: "accepted", answer: direct };

  const normalizedInput = normalizeAnswer(input);
  if (normalizedInput.length < 3) return { status: "invalid" };
  const matches = question.answers.filter((answer) =>
    answer.intentAliases.some((alias) => normalizeAnswer(alias) === normalizedInput),
  );
  if (matches.length !== 1) return { status: "invalid" };
  return { status: "confirm", answer: matches[0], normalizedInput, originalInput: input.trim() };
}
