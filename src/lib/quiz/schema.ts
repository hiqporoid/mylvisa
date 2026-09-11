import { z } from "zod";
import { CATEGORIES, RARITY_TIERS, SCORE_TIERS } from "./catalog";
import { isDateKey } from "./date";

const text = z.string().trim().min(1);
const tierPoints = z.enum(SCORE_TIERS.map(String) as [string, ...string[]]);

export const dateSchema = z.string().refine(isDateKey, "Invalid ISO calendar date");

export const answerSchema = z.strictObject({
  canonical: text,
  aliases: z.array(text).default([]),
  points: z.number().refine((value) => (SCORE_TIERS as readonly number[]).includes(value), "Unsupported score tier"),
  tier: z.enum(Object.values(RARITY_TIERS) as [string, ...string[]]),
  editorialTier: tierPoints,
  effectiveTier: tierPoints,
  provenance: text,
  explanation: text.optional(),
});

export const questionSchema = z.strictObject({
  id: z.string().regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/),
  prompt: text,
  category: z.enum(Object.keys(CATEGORIES) as [keyof typeof CATEGORIES, ...(keyof typeof CATEGORIES)[]]),
  subcategory: text.optional(),
  universeId: z.string().regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/),
  referenceDefinition: text,
  answers: z.array(answerSchema).min(5),
  explanation: text,
  source: z.strictObject({
    title: text,
    url: z.url().refine((url) => url.startsWith("https://")),
    note: text.optional(),
  }),
  tags: z.array(text).min(1),
  evergreen: z.boolean(),
  validFrom: dateSchema.optional(),
  validUntil: dateSchema.optional(),
  status: z.enum(["active", "review", "retired"]),
  version: z.number().int().positive(),
  author: text.optional(),
  rarityReview: z.enum(["editorial", "calibrate", "verified"]),
  frequency: z.strictObject({
    status: z.enum(["pending", "sampled", "calibrated"]),
    plays: z.number().int().nonnegative().optional(),
    answerCount: z.number().int().nonnegative().optional(),
  }),
}).superRefine((question, context) => {
  if (question.validFrom && question.validUntil && question.validFrom > question.validUntil)
    context.addIssue({ code: "custom", message: "validFrom must precede validUntil" });
  if (!question.evergreen && (!question.validFrom || !question.validUntil))
    context.addIssue({ code: "custom", message: "Time-sensitive questions need both validity dates" });
  if (!question.answers.some((answer) => answer.points === 10 || answer.points === 15))
    context.addIssue({ code: "custom", message: "Set needs a common low-value answer" });
  if (!question.answers.some((answer) => answer.points >= 60))
    context.addIssue({ code: "custom", message: "Set needs a rare high-value answer" });
  if (new Set(question.answers.map((answer) => answer.points)).size < 3)
    context.addIssue({ code: "custom", message: "Rarity distribution is too flat" });
  if (new Set(question.answers.map((answer) => answer.canonical)).size !== question.answers.length)
    context.addIssue({ code: "custom", message: "Duplicate canonical answers" });
  if (question.answers.some((answer) => answer.editorialTier !== String(answer.points) || answer.effectiveTier !== String(answer.points)))
    context.addIssue({ code: "custom", message: "Tier metadata must match points in the MVP" });
  if (question.answers.some((answer) => answer.tier !== RARITY_TIERS[answer.points as keyof typeof RARITY_TIERS]))
    context.addIssue({ code: "custom", message: "Rarity name must match points" });
});

export type Question = z.infer<typeof questionSchema>;
