import { expect, it } from 'vitest';
import { getDailyQuiz } from '../src/lib/server/bank';
import { addCompletedRecap } from '../src/lib/server/recap';
import { bankHash, runResponse, type Run } from '../src/lib/server/run-engine';
const quiz = getDailyQuiz('2026-09-13');
const now = new Date('2026-09-13T12:00:00Z');
function completed(): Run {
  return { id: 'owned-run', user_id: 'owner', quiz_date: '2026-09-13', release_id: quiz.releaseId,
    bank_hash: bankHash(quiz.questions), question_ids: quiz.questions.map(q => q.id), started_at: now.toISOString(),
    completed_at: now.toISOString(), round_started_at: null, current_round: 7, total_score: 0, accepted_count: 0,
    status: 'completed', version: 13, rounds: quiz.questions.map(q => ({ question_id: q.id, canonical_entity_id: null,
      points: 0, submitted_at: now.toISOString(), outcome: 'skipped' })) };
}
it('discloses exactly the owned seven-question universe, including missed rounds, with no resolver metadata', () => {
  const run = completed();
  const response = addCompletedRecap('owner', run, quiz, runResponse(run, quiz.questions, now));
  for (const [index, result] of response.results.entries()) {
    expect(result.correctAnswers).toHaveLength(quiz.questions[index].answers.length);
    expect(result.correctAnswers).toEqual(quiz.questions[index].answers.map(({canonical, points}) => ({canonical, points}))
      .sort((a,b) => a.points-b.points || a.canonical.localeCompare(b.canonical,'fi')));
    for (const answer of result.correctAnswers!) expect(Object.keys(answer).sort()).toEqual(['canonical','points']);
  }
});
it.each([0,1,2,3,4,5,6])('does not disclose after %i terminal rounds', count => {
  const run = completed(); run.rounds = run.rounds.slice(0,count); run.current_round = count;
  run.completed_at = null; run.status = count ? 'feedback' : 'answering';
  const result = addCompletedRecap('owner', run, quiz, runResponse(run, quiz.questions, now));
  expect(JSON.stringify(result)).not.toContain('correctAnswers');
});
it('rejects another owner and inconsistent completed states', () => {
  const run = completed(); const response = runResponse(run, quiz.questions, now);
  expect(() => addCompletedRecap('other',run,quiz,response)).toThrow('Peliä ei löytynyt');
  for (const patch of [{ rounds: run.rounds.slice(0,6) }, { current_round: 6 }, { completed_at: null },
    { question_ids: ['arbitrary-question', ...run.question_ids.slice(1)] }, { bank_hash: 'forged' }, { release_id: 'other-release' }])
    expect(() => addCompletedRecap('owner',{...run,...patch},quiz,response)).toThrow();
  expect(() => addCompletedRecap('owner',run,quiz,{...response,date:'2026-09-12'})).toThrow();
  expect(() => addCompletedRecap('owner',run,quiz,{...response,mode:'practice'})).toThrow();
});
