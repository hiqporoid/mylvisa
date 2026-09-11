import { QuizApp } from "@/components/quiz-app";
import { helsinkiDate } from "@/lib/quiz/date";
import { getDailyQuiz } from "@/lib/server/bank";
export const dynamic = "force-dynamic";
export default function Home() {
  const date = helsinkiDate();
  const { questions } = getDailyQuiz(date);
  return <QuizApp initialDate={date} length={questions.length} />;
}
