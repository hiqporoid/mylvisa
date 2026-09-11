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

export const completenessSchema = z.strictObject({
  status: z.literal("verified"),
  source: z.url().refine((url) => url.startsWith("https://")),
  asOf: dateSchema,
  expectedCount: z.number().int().positive(),
  basis: text,
});

export const questionSchema = z.strictObject({
  id: z.string().regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/),
  prompt: text,
  category: z.enum(Object.keys(CATEGORIES) as [keyof typeof CATEGORIES, ...(keyof typeof CATEGORIES)[]]),
  subcategory: text.optional(),
  universeId: z.string().regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/),
  referenceDefinition: text,
  completeness: completenessSchema,
  answers: z.array(answerSchema).min(1),
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
  dailyEligible: z.boolean(),
  accessibilityReview: z.enum(["verified", "needs-review"]),
  accessibility: z.number().int().min(1).max(5),
  dailyEligibilityReason: text.optional(),
  baseUniverseId: z.string().regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/).optional(),
  predicateId: z.string().regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/).optional(),
  version: z.number().int().positive(),
  author: text.optional(),
  contentReview: z.enum(["pending", "verified", "retire"]),
  rarityReview: z.enum(["pending", "editorial-reviewed", "calibrate"]),
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
  if (new Set(question.answers.map((answer) => answer.canonical)).size !== question.answers.length)
    context.addIssue({ code: "custom", message: "Duplicate canonical answers" });
  if (question.answers.some((answer) => answer.editorialTier !== String(answer.points) || answer.effectiveTier !== String(answer.points)))
    context.addIssue({ code: "custom", message: "Tier metadata must match points in the MVP" });
  if (question.answers.some((answer) => answer.tier !== RARITY_TIERS[answer.points as keyof typeof RARITY_TIERS]))
    context.addIssue({ code: "custom", message: "Rarity name must match points" });
  if (question.status === "active" && (question.contentReview !== "verified" || question.rarityReview !== "editorial-reviewed"))
    context.addIssue({ code: "custom", message: "Active questions require verified content and editorial rarity review" });
  if (question.dailyEligible && question.status !== "active")
    context.addIssue({ code: "custom", message: "Daily-eligible questions must be active" });
  if (question.dailyEligible && question.accessibilityReview !== "verified")
    context.addIssue({ code: "custom", message: "Daily-eligible questions require verified accessibility review" });
  if (question.dailyEligible && question.accessibility < 4)
    context.addIssue({ code: "custom", message: "Daily-eligible questions need accessibility score 4 or 5" });
  if (question.dailyEligible && question.answers.length < 8 && !question.dailyEligibilityReason)
    context.addIssue({ code: "custom", message: "Small daily universes need an explicit eligibility reason" });
});

export type Question = z.infer<typeof questionSchema>;
