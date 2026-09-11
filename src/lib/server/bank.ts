import "server-only";
import { releases } from "@/data/releases";
import { questionSchema } from "@/lib/quiz/schema";
import { selectDailyQuestions } from "@/lib/quiz/selection";
const parsed = releases.map((release) => ({
  ...release,
  questions: release.questions.map((q) => questionSchema.parse(q)),
}));
export function getDailyQuiz(date: string) {
  const release = parsed.findLast((r) => r.effectiveFrom <= date);
  if (!release) throw new Error("No bank release for this date");
  return {
    releaseId: release.id,
    questions: selectDailyQuestions(release.questions, date, {
      length: release.length,
      seed: release.id,
      epoch: release.effectiveFrom,
    }),
  };
}
