-- Authoritative writes are service-role-only; clients only read their own rows.
begin;
create table public.profiles (
 user_id uuid primary key references auth.users(id) on delete cascade,
 nickname text not null,
 nickname_normalized text generated always as (lower(normalize(btrim(nickname), NFC))) stored,
 created_at timestamptz not null default now(),
 updated_at timestamptz not null default now(),
 constraint nickname_valid check (
   nickname = normalize(btrim(nickname), NFC) and char_length(nickname) between 3 and 20
   and nickname !~ '[^A-Za-zÀ-ÖØ-öø-ÿ0-9 _-]'
   and lower(nickname) not in ('admin','administrator','mylvisa','ylläpito','yllapito','moderator','moderaattori','support','tuki','null','undefined')
 ),
 unique(nickname_normalized)
);
create table public.daily_runs (
 id uuid primary key,
 user_id uuid not null references auth.users(id) on delete cascade,
 quiz_date date not null,
 release_id text not null,
 bank_hash text not null,
 question_ids text[] not null check(cardinality(question_ids)=7),
 started_at timestamptz not null,
 completed_at timestamptz,
 round_started_at timestamptz,
 current_round integer not null default 0 check(current_round between 0 and 7),
 total_score integer not null default 0 check(total_score between 0 and 700),
 accepted_count integer not null default 0 check(accepted_count between 0 and current_round),
 status text not null check(status in ('answering','feedback','completed')),
 version integer not null default 0 check(version>=0),
 rounds jsonb not null default '[]' check(jsonb_typeof(rounds)='array' and jsonb_array_length(rounds)=current_round),
 unique(user_id,quiz_date),
 check ((status='completed') = (completed_at is not null)),
 check ((status='completed') = (current_round=7)),
 check ((status='answering') = (round_started_at is not null)),
 check (quiz_date=(started_at at time zone 'Europe/Helsinki')::date)
);
create index daily_runs_completed_date on public.daily_runs(quiz_date) where status='completed';
alter table public.profiles enable row level security;
alter table public.daily_runs enable row level security;
revoke all on public.profiles,public.daily_runs from anon,authenticated;
grant select on public.profiles,public.daily_runs to authenticated;
grant all on public.profiles,public.daily_runs to service_role;
create policy profile_owner_read on public.profiles for select to authenticated using ((select auth.uid())=user_id);
create policy run_owner_read on public.daily_runs for select to authenticated using ((select auth.uid())=user_id);

create function public.mylvisa_set_nickname(owner_id uuid,new_nickname text)
returns void language plpgsql security invoker set search_path='' as $$
declare previous public.profiles;
begin
 -- Serialize first creation and subsequent changes for this identity.
 perform pg_advisory_xact_lock(hashtextextended(owner_id::text,0));
 select * into previous from public.profiles where user_id=owner_id for update;
 if found then
   if previous.nickname=new_nickname then return; end if;
   if previous.updated_at>now()-interval '24 hours' then raise exception 'nickname_rate_limit'; end if;
   update public.profiles set nickname=new_nickname,updated_at=now() where user_id=owner_id;
 else
   insert into public.profiles(user_id,nickname) values(owner_id,new_nickname);
 end if;
end $$;

create function public.mylvisa_commit_run(run_id uuid,owner_id uuid,expected_version integer,next_state jsonb)
returns jsonb language plpgsql security invoker set search_path='' as $$
declare previous public.daily_runs; candidate public.daily_runs;
begin
 select * into strict previous from public.daily_runs where id=run_id and user_id=owner_id for update;
 if previous.version<>expected_version or previous.status='completed' then return to_jsonb(previous); end if;
 candidate := jsonb_populate_record(null::public.daily_runs,next_state);
 if candidate.id<>previous.id or candidate.user_id<>previous.user_id or candidate.quiz_date<>previous.quiz_date
 or candidate.release_id<>previous.release_id or candidate.bank_hash<>previous.bank_hash or candidate.question_ids<>previous.question_ids
 or candidate.started_at<>previous.started_at or candidate.version<>previous.version+1
 or (previous.quiz_date<>(now() at time zone 'Europe/Helsinki')::date)
 then raise exception 'invalid_run_transition'; end if;
 if previous.status='feedback' then
   if candidate.status<>'answering' or candidate.current_round<>previous.current_round or candidate.rounds<>previous.rounds
   or candidate.total_score<>previous.total_score or candidate.accepted_count<>previous.accepted_count then raise exception 'invalid_next'; end if;
 else
   if candidate.current_round<>previous.current_round+1 or candidate.status not in ('feedback','completed')
   or (candidate.rounds - previous.current_round)<>previous.rounds then raise exception 'invalid_submission'; end if;
 end if;
 update public.daily_runs set completed_at=candidate.completed_at,round_started_at=candidate.round_started_at,
 current_round=candidate.current_round,total_score=candidate.total_score,accepted_count=candidate.accepted_count,
 status=candidate.status,version=candidate.version,rounds=candidate.rounds where id=run_id returning * into candidate;
 return to_jsonb(candidate);
end $$;

create function public.mylvisa_leaderboard(first_date date,last_date date)
returns table(nickname text,score bigint,games bigint,average numeric,best integer,rank bigint,accepted_count bigint)
language sql stable security invoker set search_path='' as $$
 with totals as (
  select p.nickname,sum(r.total_score) score,count(*) games,round(avg(r.total_score),1) average,
   max(r.total_score) best,sum(r.accepted_count) accepted_count,min(r.completed_at) first_completion
  from public.daily_runs r join public.profiles p on p.user_id=r.user_id
  where r.status='completed' and r.quiz_date between first_date and last_date
  group by p.user_id,p.nickname
 ), ranked as (
  select *,rank() over(order by score desc) shared_rank from totals
 )
 select nickname,score,games,average,best,shared_rank,accepted_count from ranked
 order by score desc,first_completion,nickname limit 100;
$$;
revoke all on function public.mylvisa_set_nickname(uuid,text) from public,anon,authenticated;
revoke all on function public.mylvisa_commit_run(uuid,uuid,integer,jsonb) from public,anon,authenticated;
revoke all on function public.mylvisa_leaderboard(date,date) from public,anon,authenticated;
grant execute on function public.mylvisa_set_nickname(uuid,text) to service_role;
grant execute on function public.mylvisa_commit_run(uuid,uuid,integer,jsonb) to service_role;
grant execute on function public.mylvisa_leaderboard(date,date) to service_role;
commit;
