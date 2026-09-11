import { z } from "zod";
import { CATEGORIES, DIFFICULTIES, SCORE_TIERS } from "./catalog";
import { isDateKey } from "./date";
const text = z.string().trim().min(1);
export const dateSchema = z
  .string()
  .refine(isDateKey, "Invalid ISO calendar date");
export const answerSchema = z.strictObject({
  canonical: text,
  points: z
    .number()
    .refine(
      (n) => (SCORE_TIERS as readonly number[]).includes(n),
      "Unsupported score tier",
    ),
  aliases: z.array(text).default([]),
  explanation: text.optional(),
});
export const questionSchema = z
  .strictObject({
    id: z.string().regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/),
    question: text,
    category: z.enum(
      Object.keys(CATEGORIES) as [
        keyof typeof CATEGORIES,
        ...(keyof typeof CATEGORIES)[],
      ],
    ),
    subcategory: text.optional(),
    difficulty: z.enum(DIFFICULTIES),
    answers: z.array(answerSchema).min(1),
    canonicalAnswer: text,
    explanation: text,
    sources: z
      .array(
        z.strictObject({
          title: text,
          url: z
            .url()
            .refine((url) => url.startsWith("https://"))
            .optional(),
          note: text.optional(),
        }),
      )
      .min(1),
    tags: z.array(text).min(1),
    evergreen: z.boolean(),
    validFrom: dateSchema.optional(),
    validUntil: dateSchema.optional(),
    status: z.enum(["active", "review", "retired"]),
    version: z.number().int().positive(),
    author: text.optional(),
  })
  .superRefine((q, ctx) => {
    if (q.validFrom && q.validUntil && q.validFrom > q.validUntil)
      ctx.addIssue({
        code: "custom",
        message: "validFrom must precede validUntil",
      });
    if (!q.evergreen && (!q.validFrom || !q.validUntil))
      ctx.addIssue({
        code: "custom",
        message: "Time-sensitive questions need both validity dates",
      });
  });
export type Question = z.infer<typeof questionSchema>;
