import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { PGlite } from '@electric-sql/pglite';
import { readFileSync } from 'node:fs';
import { validateNickname } from '../src/lib/profile/nickname';
import { publicLeaderboard } from '../src/lib/profile/leaderboard';
import { bankHash, entityId, runCommand, transition, runResponse, type Run } from '../src/lib/server/run-engine';
import { getDailyQuiz } from '../src/lib/server/bank';
const date='2026-09-11';
const questions=getDailyQuiz(date).questions;
const user='00000000-0000-4000-8000-000000000001';
const other='00000000-0000-4000-8000-000000000002';
const runId='10000000-0000-4000-8000-000000000001';
function initial():Run { return {id:runId,user_id:user,quiz_date:date,release_id:getDailyQuiz(date).releaseId,bank_hash:bankHash(questions),question_ids:questions.map(q=>q.id),started_at:date+'T09:00:00.000Z',round_started_at:date+'T09:00:00.000Z',completed_at:null,current_round:0,total_score:0,accepted_count:0,status:'answering',version:0,rounds:[]}; }
const answer=(run=initial(),value=questions[0].answers[0].canonical,seconds=4)=>transition(run,{action:'answer',version:run.version,questionId:questions[run.current_round].id,answer:value},questions,new Date(date+`T09:00:${String(seconds).padStart(2,'0')}.000Z`));
describe('authoritative run boundary',()=>{
 it('anonymous identity needs no email to play',()=>expect(answer().current_round).toBe(1));
 it('rejects client points and timing fields',()=>{expect(runCommand.safeParse({action:'start',score:700}).success).toBe(false);expect(runCommand.safeParse({action:'answer',version:0,questionId:'x',answer:'x',roundStartedAt:date}).success).toBe(false);});
 it('recalculates awarded points from server bank',()=>expect(answer().total_score).toBe(questions[0].answers[0].points));
 it('wrong answers are final zeros',()=>{const wrong=answer(initial(),'invalid-no-answer');expect(wrong.total_score).toBe(0);expect(transition(wrong,{action:'answer',version:0,questionId:questions[0].id,answer:questions[0].answers[0].canonical},questions,new Date(date+'T09:00:05Z'))).toEqual(wrong);});
 it('deadline is exclusive and late answer scores zero',()=>{expect(answer(initial(),questions[0].answers[0].canonical,28).total_score).toBe(0);expect(answer(initial(),questions[0].answers[0].canonical,29).rounds[0].outcome).toBe('timeout');});
 it('rejects submissions during 3-second preview',()=>expect(()=>answer(initial(),'x',2)).toThrow('Lue kysymys'));
 it('persists canonical entity IDs without raw text',()=>{const next=answer();expect(next.rounds[0].canonical_entity_id).toBe(entityId(questions[0],questions[0].answers[0].canonical));expect(next.rounds[0]).not.toHaveProperty('answer');});
 it('wrong text is not permanently stored',()=>expect(JSON.stringify(answer(initial(),'private-secret-input'))).not.toContain('private-secret-input'));
 it('does not reveal the next prompt in feedback',()=>expect(runResponse(answer(),questions,new Date()).current).toBeNull());
 it('refresh cannot reset active timer',()=>expect(transition(initial(),{action:'next',version:0},questions,new Date(date+'T09:00:10Z'))).toEqual(initial()));
 it('stale request cannot overwrite round state',()=>{const run=answer();expect(transition(run,{action:'next',version:0},questions,new Date(date+'T09:00:10Z'))).toEqual(run);});
 it('release changes cannot regrade a live run',()=>expect(()=>transition({...initial(),bank_hash:'different'},{action:'next',version:0},questions,new Date(date+'T09:00:00Z'))).toThrow('sisältö'));
 it('never publishes private identifiers from leaderboard rows',()=>{const rows=publicLeaderboard([{nickname:'Olli',score:700,games:1,average:700,best:700,rank:1,accepted_count:7,user_id:user,email:'secret@example.invalid',answers:['secret']}]);expect(Object.keys(rows[0]).sort()).toEqual(['nickname','score','games','average','best','rank','accepted_count'].sort());expect(JSON.stringify(rows)).not.toContain(user);});
 it.each(['ab','a'.repeat(21),'admin','https://x.fi','<script>','a\u0000b','a\u202eb','a\u200db'])('rejects invalid nickname %s',value=>expect(()=>validateNickname(value)).toThrow());
 it('supports Finnish letters, trimming and canonical Unicode normalization',()=>{expect(validateNickname('  Ääkkönen  ')).toEqual({nickname:'Ääkkönen',normalized:'ääkkönen'});expect(validateNickname('A\u0308a\u0308kkönen').normalized).toBe('ääkkönen');});
});
describe('real Postgres migration and RLS',()=>{
 const db=new PGlite();
 beforeAll(async()=>{
  await db.exec(`create role anon; create role authenticated; create role service_role bypassrls; create schema auth; create table auth.users(id uuid primary key,email text,is_anonymous boolean default true); create function auth.uid() returns uuid language sql stable as $$ select nullif(current_setting('request.jwt.claim.sub',true),'')::uuid $$; grant usage on schema public,auth to anon,authenticated,service_role; grant execute on function auth.uid() to authenticated;`);
  await db.exec(readFileSync('supabase/migrations/20260912081420_mylvisa_connected_beta.sql','utf8'));
  await db.query('insert into auth.users(id) values($1),($2)',[user,other]);
 },30000);
 afterAll(()=>db.close());
 it('anonymous user can create nickname through trusted boundary',async()=>{await db.query('select public.mylvisa_set_nickname($1,$2)',[user,'Ääkkönen']);const result=await db.query('select nickname from profiles where user_id=$1',[user]);expect(result.rows).toEqual([{nickname:'Ääkkönen'}]);});
 it('database nickname uniqueness ignores case',async()=>{await expect(db.query('select public.mylvisa_set_nickname($1,$2)',[other,'ääkkönen'])).rejects.toThrow();});
 it('database enforces nickname constraints even if server checks are bypassed',async()=>{await expect(db.query('insert into profiles(user_id,nickname) values($1,$2)',[other,'<bad>'])).rejects.toThrow();});
 it('rate limits nickname changes atomically',async()=>{await expect(db.query('select public.mylvisa_set_nickname($1,$2)',[user,'Toinen'])).rejects.toThrow('nickname_rate_limit');});
 it('unique user/date blocks a second scored run and allows a different user',async()=>{
  const r=initial(); await db.query('insert into daily_runs select * from jsonb_populate_record(null::daily_runs,$1)',[JSON.stringify(r)]);
  await expect(db.query('insert into daily_runs select * from jsonb_populate_record(null::daily_runs,$1)',[JSON.stringify({...r,id:'10000000-0000-4000-8000-000000000003'})])).rejects.toThrow();
  await db.query('insert into daily_runs select * from jsonb_populate_record(null::daily_runs,$1)',[JSON.stringify({...r,id:'10000000-0000-4000-8000-000000000002',user_id:other})]);
 });
 it('RLS hides other profiles/runs; clients cannot write scores or invoke trusted RPCs',async()=>{
  await db.exec(`set role authenticated; select set_config('request.jwt.claim.sub','${other}',false);`);
  try { expect((await db.query('select * from profiles')).rows).toHaveLength(0);expect((await db.query('select * from daily_runs')).rows).toHaveLength(1);await expect(db.exec('update daily_runs set total_score=700')).rejects.toThrow();await expect(db.query('select public.mylvisa_set_nickname($1,$2)',[other,'Hacker'])).rejects.toThrow();await expect(db.query('select public.mylvisa_commit_run($1,$2,0,$3)',[runId,user,'{}'])).rejects.toThrow();await expect(db.exec("select * from public.mylvisa_leaderboard('2026-09-01','2026-09-11')")).rejects.toThrow(); } finally {await db.exec('reset role');}
 });
 it('database commit serializes retries and rejects another owner',async()=>{
  const today=(await db.query<{date:string}>("select to_char(now() at time zone 'Europe/Helsinki','YYYY-MM-DD') as date")).rows[0].date;
  const owner='00000000-0000-4000-8000-000000000003';
  await db.query('insert into auth.users(id) values($1)',[owner]);
  const run={...initial(),id:'40000000-0000-4000-8000-000000000001',user_id:owner,quiz_date:today,started_at:today+'T09:00:00Z',round_started_at:today+'T09:00:00Z'};
  await db.query('insert into daily_runs select * from jsonb_populate_record(null::daily_runs,$1)',[JSON.stringify(run)]);
  const next=transition(run,{action:'answer',version:0,questionId:questions[0].id,answer:questions[0].answers[0].canonical},questions,new Date(today+'T09:00:04Z'));
  await db.exec('set role service_role');
  try {
   await expect(db.query('select mylvisa_commit_run($1,$2,0,$3)',[run.id,other,JSON.stringify(next)])).rejects.toThrow();
   const first=await db.query<{state:Run}>('select mylvisa_commit_run($1,$2,0,$3) as state',[run.id,owner,JSON.stringify(next)]);
   const replay=await db.query<{state:Run}>('select mylvisa_commit_run($1,$2,0,$3) as state',[run.id,owner,JSON.stringify({...next,total_score:700})]);
   expect(replay.rows[0].state).toEqual(first.rows[0].state);expect(first.rows[0].state.current_round).toBe(1);expect(first.rows[0].state.total_score).toBe(questions[0].answers[0].points);
  } finally {await db.exec('reset role');}
 });
 it('email upgrade preserves same user id, profile and result',async()=>{await db.query('update auth.users set email=$2,is_anonymous=false where id=$1',[user,'test@example.invalid']);expect((await db.query('select nickname from profiles where user_id=$1',[user])).rows).toHaveLength(1);expect((await db.query('select id from daily_runs where user_id=$1',[user])).rows).toHaveLength(1);});
 it('completed results appear after nickname creation; ties share rank, week and lifetime aggregate correctly',async()=>{
  await db.query('select public.mylvisa_set_nickname($1,$2)',[other,'Toinen']);
  const rounds=questions.map(q=>({question_id:q.id,canonical_entity_id:null,points:0,submitted_at:date+'T09:05:00Z',outcome:'blank'}));
  await db.query("update daily_runs set status='completed',completed_at=$1,round_started_at=null,current_round=7,rounds=$2,total_score=100",[date+'T09:05:00Z',JSON.stringify(rounds)]);
  let result=await db.query<{rank:number;score:number;games:number}>("select * from mylvisa_leaderboard('2026-09-11','2026-09-11')");expect(result.rows).toHaveLength(2);expect(result.rows.map(r=>Number(r.rank))).toEqual([1,1]);
  for(const d of ['2026-09-05','2026-09-04']) await db.query('insert into daily_runs select * from jsonb_populate_record(null::daily_runs,$1)',[JSON.stringify({...initial(),id:d.endsWith('05')?'20000000-0000-4000-8000-000000000001':'30000000-0000-4000-8000-000000000001',quiz_date:d,started_at:d+'T09:00:00Z',status:'completed',round_started_at:null,completed_at:d+'T09:05:00Z',current_round:7,rounds,total_score:50})]);
  result=await db.query<{rank:number;score:number;games:number}>("select * from mylvisa_leaderboard('2026-09-05','2026-09-11')");expect(Number(result.rows[0].score)).toBe(150);expect(Number(result.rows[0].games)).toBe(2);
  result=await db.query<{rank:number;score:number;games:number}>("select * from mylvisa_leaderboard('2026-09-01','2026-09-11')");expect(Number(result.rows[0].score)).toBe(200);expect(Number(result.rows[0].games)).toBe(3);
 });
});
