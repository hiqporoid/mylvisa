import "server-only";
import { releases } from "@/data/releases";
import { questionSchema } from "@/lib/quiz/schema";
import { selectDailyQuestions } from "@/lib/quiz/selection";
const parsed = releases.map((release) => ({
  ...release,
  questions: release.questions.map((q) => questionSchema.parse(q)),
}));
export function getDailyQuiz(date: string, releaseId?: string) {
  const release = releaseId
    ? parsed.find((item) => item.id === releaseId && item.effectiveFrom <= date)
    : parsed.findLast((item) => item.effectiveFrom <= date);
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
