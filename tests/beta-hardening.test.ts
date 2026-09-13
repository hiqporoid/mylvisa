import { describe, expect, it, vi } from 'vitest';
import { readMutation } from '../src/lib/server/http';
import { getDailyQuiz } from '../src/lib/server/bank';
import { bankHash, transition, type Run } from '../src/lib/server/run-engine';
import { addDays } from '../src/lib/quiz/date';
import { CATEGORIES } from '../src/lib/quiz/catalog';
import { readGame, saveGame, STORAGE_PREFIX } from '../src/lib/client/storage';
import bank from '../src/data/releases/2026-09-11.json';
import decisions from '../docs/internal/editorial-decisions-2026-09.json';

describe('connected request boundary', () => {
 it('rejects cross-site writes', async () => {
  const request = new Request('https://mylvisa.example/api/daily', {method:'POST',headers:{origin:'https://attacker.example','content-type':'application/json'},body:'{"action":"start"}'});
  await expect(readMutation(request)).rejects.toThrow('sallittu');
 });
 it('counts streamed bytes even without Content-Length', async () => {
  const request = new Request('https://mylvisa.example/api/daily', {method:'POST',headers:{origin:'https://mylvisa.example','content-type':'application/json'},body:JSON.stringify({answer:'x'.repeat(2500)})});
  await expect(readMutation(request)).rejects.toThrow('pitkä');
 });
 it('scores seven server-evaluated long-tail answers as 700', () => {
  const date='2026-09-11'; const quiz=getDailyQuiz(date); let now=new Date(date+'T10:00:00Z');
  let run:Run={id:'test',user_id:'anonymous',quiz_date:date,release_id:quiz.releaseId,bank_hash:bankHash(quiz.questions),question_ids:quiz.questions.map(q=>q.id),started_at:now.toISOString(),completed_at:null,round_started_at:now.toISOString(),current_round:0,total_score:0,accepted_count:0,status:'answering',version:0,rounds:[]};
  for(const question of quiz.questions){
   now=new Date(now.getTime()+4000);
   run=transition(run,{action:'answer',version:run.version,questionId:question.id,answer:question.answers.find(a=>a.points===100)!.canonical},quiz.questions,now);
   if(run.status!=='completed') run=transition(run,{action:'next',version:run.version},quiz.questions,now);
  }
  expect(run.total_score).toBe(700); expect(run.accepted_count).toBe(7); expect(run.status).toBe('completed');
 });
});
describe('editorial and selection gates',()=>{
 it('keeps source membership enumerations out of gameplay feedback',()=>{
  for(const id of ['games-elder-scrolls-anthology','games-orange-box-steam','digital-historic-generic-tlds']){
   const question=bank.find(q=>q.id===id)!;
   for(const answer of question.answers) expect(question.explanation.toLowerCase()).not.toContain(answer.canonical.toLowerCase());
  }
 });
 it('records one classification for all 376 original Daily questions',()=>expect(Object.keys(decisions)).toHaveLength(376));
 it('has all 19 categories and remains below 15% gaming/digital concentration',()=>{
  const daily=bank.filter(q=>q.dailyEligible);expect(new Set(daily.map(q=>q.category)).size).toBe(19);expect(Object.keys(CATEGORIES)).toHaveLength(19);
  expect(daily.filter(q=>['videopelit','internet-ja-digikulttuuri'].includes(q.category)).length/daily.length).toBeLessThanOrEqual(.15);
  expect(daily.every(q=>q.answers.some(a=>a.points===100))).toBe(true);
 });
 it('keeps each daily 700 maximum, category caps and semantic families over a year',()=>{
  for(let n=0;n<365;n++){
   const questions=getDailyQuiz(addDays('2026-09-01',n)).questions;
   expect(questions).toHaveLength(7);expect(new Set(questions.map(q=>q.familyId)).size).toBe(7);
   for(const category of ['videopelit','internet-ja-digikulttuuri'])expect(questions.filter(q=>q.category===category).length).toBeLessThanOrEqual(1);
   expect(questions.reduce((sum,q)=>sum+Math.max(...q.answers.map(a=>a.points)),0)).toBe(700);
  }
 });
});
it('preserves pre-Supabase local data in an archive before replacing a release',()=>{
 const values=new Map<string,string>();vi.stubGlobal('localStorage',{getItem:(k:string)=>values.get(k)??null,setItem:(k:string,v:string)=>values.set(k,v)});
 try {
  values.set(STORAGE_PREFIX+'2026-09-11',JSON.stringify({version:2,date:'2026-09-11',started:true,feedback:false,answers:['old']}));
  expect(saveGame({version:2,date:'2026-09-11',releaseId:'new',started:true,feedback:false,answers:[]})).toBe(true);
  expect(JSON.parse(values.get('mylvisa:archive:2026-09-11:legacy')!).answers).toEqual(['old']);
  expect(readGame('2026-09-11')?.releaseId).toBe('new');
 } finally {vi.unstubAllGlobals();}
});
