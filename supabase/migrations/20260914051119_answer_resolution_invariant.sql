-- Invalid attempts and confirmation candidates never reach this function.
-- Tighten the existing atomic boundary so only one well-formed terminal round
-- can be appended and client-supplied totals cannot be smuggled through.
begin;

create or replace function public.mylvisa_commit_run(run_id uuid,owner_id uuid,expected_version integer,next_state jsonb)
returns jsonb language plpgsql security invoker set search_path='' as $$
declare
 previous public.daily_runs;
 candidate public.daily_runs;
 new_round jsonb;
 round_outcome text;
 round_points integer;
begin
 select * into strict previous from public.daily_runs where id=run_id and user_id=owner_id for update;
 if previous.version<>expected_version or previous.status='completed' then return to_jsonb(previous); end if;
 candidate := jsonb_populate_record(null::public.daily_runs,next_state);

 if candidate.id<>previous.id or candidate.user_id<>previous.user_id or candidate.quiz_date<>previous.quiz_date
 or candidate.release_id<>previous.release_id or candidate.bank_hash<>previous.bank_hash or candidate.question_ids<>previous.question_ids
 or candidate.started_at<>previous.started_at or candidate.version<>previous.version+1
 or previous.quiz_date<>(now() at time zone 'Europe/Helsinki')::date
 then raise exception 'invalid_run_transition'; end if;

 if previous.status='feedback' then
   if candidate.status<>'answering' or candidate.current_round<>previous.current_round or candidate.rounds<>previous.rounds
   or candidate.total_score<>previous.total_score or candidate.accepted_count<>previous.accepted_count
   or candidate.completed_at is not null or candidate.round_started_at is null
   or candidate.round_started_at<previous.started_at or candidate.round_started_at>now()+interval '5 seconds'
   then raise exception 'invalid_next'; end if;
 else
   if candidate.current_round<>previous.current_round+1 or candidate.status not in ('feedback','completed')
   or (candidate.rounds - previous.current_round)<>previous.rounds or candidate.round_started_at is not null
   then raise exception 'invalid_submission'; end if;

   new_round := candidate.rounds -> previous.current_round;
   round_outcome := new_round ->> 'outcome';
   round_points := (new_round ->> 'points')::integer;
   if new_round ->> 'question_id' is distinct from previous.question_ids[previous.current_round+1]
   or round_outcome is null or round_outcome not in ('accepted','timeout','skipped')
   or round_points is null or not (new_round ? 'submitted_at')
   or (new_round ->> 'submitted_at')::timestamptz < previous.round_started_at
   or (new_round ->> 'submitted_at')::timestamptz > now()+interval '5 seconds'
   then raise exception 'invalid_round_result'; end if;

   if round_outcome='accepted' then
     if coalesce(new_round ->> 'canonical_entity_id','') !~ '^[0-9a-f]{64}$'
     or round_points not in (10,15,30,60,85,100)
     or char_length(btrim(coalesce(new_round ->> 'original_input',''))) not between 1 and 160
     or candidate.total_score<>previous.total_score+round_points
     or candidate.accepted_count<>previous.accepted_count+1
     then raise exception 'invalid_accepted_result'; end if;
   else
     if new_round -> 'canonical_entity_id' is distinct from 'null'::jsonb or round_points<>0 or new_round ? 'original_input'
     or candidate.total_score<>previous.total_score or candidate.accepted_count<>previous.accepted_count
     then raise exception 'invalid_zero_result'; end if;
   end if;

   if candidate.current_round=cardinality(candidate.question_ids) then
     if candidate.status<>'completed' or candidate.completed_at is null then raise exception 'invalid_completion'; end if;
   elsif candidate.status<>'feedback' or candidate.completed_at is not null then
     raise exception 'invalid_feedback';
   end if;
 end if;

 update public.daily_runs set completed_at=candidate.completed_at,round_started_at=candidate.round_started_at,
 current_round=candidate.current_round,total_score=candidate.total_score,accepted_count=candidate.accepted_count,
 status=candidate.status,version=candidate.version,rounds=candidate.rounds where id=run_id returning * into candidate;
 return to_jsonb(candidate);
end $$;

revoke all on function public.mylvisa_commit_run(uuid,uuid,integer,jsonb) from public,anon,authenticated;
grant execute on function public.mylvisa_commit_run(uuid,uuid,integer,jsonb) to service_role;

commit;
