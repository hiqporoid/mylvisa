import 'server-only';
import type { QuizResponse } from '../quiz/contracts';
import type { Question } from '../quiz/schema';
import { bankHash, type Run } from './run-engine';
import { GameError } from './game';

/** Called only with a persisted run loaded by the authenticated ownership query. */
export function addCompletedRecap(userId: string, run: Run, quiz: { releaseId: string; questions: Question[] }, response: QuizResponse): QuizResponse {
  if (run.user_id !== userId) throw new GameError('RUN_NOT_FOUND', 404, 'Peliä ei löytynyt.');
  if (run.status !== 'completed') return response;
  const questions = quiz.questions;
  const terminal = new Set(['accepted', 'timeout', 'skipped', 'wrong', 'blank']);
  if (!run.completed_at || run.current_round !== 7 || run.rounds.length !== 7 || questions.length !== 7 ||
      run.question_ids.length !== 7 || run.release_id !== quiz.releaseId || response.releaseId !== run.release_id ||
      response.date !== run.quiz_date || response.mode !== 'daily' || response.results.length !== 7 ||
      !response.summary || run.bank_hash !== bankHash(questions) ||
      questions.some((q, index) => run.question_ids[index] !== q.id || run.rounds[index].question_id !== q.id ||
        response.results[index].id !== q.id || !terminal.has(run.rounds[index].outcome)))
    throw new GameError('RECAP_UNAVAILABLE', 409, 'Pelin yhteenvetoa ei voi vielä avata.');
  return { ...response, results: response.results.map((result, index) => ({
    ...result,
    correctAnswers: questions[index].answers.map(({ canonical, points }) => ({ canonical, points }))
      .sort((a, b) => a.points - b.points || a.canonical.localeCompare(b.canonical, 'fi')),
  })) };
}
