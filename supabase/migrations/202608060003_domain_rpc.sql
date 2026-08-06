create or replace function public.lock_owned_session(p_session_id uuid)
returns public.sessions
language plpgsql
security definer
set search_path = public
as $$
declare
  result public.sessions;
begin
  select s.*
  into result
  from public.sessions s
  join public.tasks t
    on t.id = s.task_id
  join public.milestones m
    on m.id = t.milestone_id
  join public.deadlines d
    on d.id = m.deadline_id
  where s.id = p_session_id
    and d.user_id = auth.uid()
  for update of s;

  if result.id is null then
    raise exception using errcode = '42501', message = 'Session is not accessible';
  end if;

  return result;
end;
$$;

create or replace function public.start_session(p_session_id uuid)
returns public.sessions
language plpgsql
security definer
set search_path = public
as $$
declare
  locked_session public.sessions;
  task_progress numeric(5,2);
  result public.sessions;
  started_at_value timestamptz := now();
begin
  locked_session := public.lock_owned_session(p_session_id);

  if locked_session.status <> 'PLANNED' then
    raise exception using errcode = '22023', message = 'Only PLANNED sessions can start';
  end if;

  select current_progress
  into task_progress
  from public.tasks
  where id = locked_session.task_id
  for update;

  update public.sessions
  set status = 'IN_PROGRESS',
      progress_before = task_progress,
      started_at = started_at_value,
      paused_at = null,
      expected_end_at = started_at_value + make_interval(mins => estimated_minutes),
      ended_at = null
  where id = p_session_id
  returning *
  into result;

  return result;
end;
$$;

create or replace function public.pause_session(p_session_id uuid)
returns public.sessions
language plpgsql
security definer
set search_path = public
as $$
declare
  locked_session public.sessions;
  result public.sessions;
begin
  locked_session := public.lock_owned_session(p_session_id);

  if locked_session.status <> 'IN_PROGRESS' then
    raise exception using errcode = '22023', message = 'Only IN_PROGRESS sessions can pause';
  end if;

  if locked_session.started_at is null or locked_session.expected_end_at is null then
    raise exception using errcode = '22023', message = 'Session must be started before it can pause';
  end if;

  update public.sessions
  set status = 'PAUSED',
      paused_at = now()
  where id = p_session_id
  returning *
  into result;

  return result;
end;
$$;

create or replace function public.resume_session(p_session_id uuid)
returns public.sessions
language plpgsql
security definer
set search_path = public
as $$
declare
  locked_session public.sessions;
  result public.sessions;
  resumed_at timestamptz := now();
begin
  locked_session := public.lock_owned_session(p_session_id);

  if locked_session.status <> 'PAUSED' then
    raise exception using errcode = '22023', message = 'Only PAUSED sessions can resume';
  end if;

  if locked_session.paused_at is null or locked_session.expected_end_at is null then
    raise exception using errcode = '22023', message = 'Paused session is missing paused timing information';
  end if;

  update public.sessions
  set status = 'IN_PROGRESS',
      paused_at = null,
      expected_end_at = locked_session.expected_end_at + (resumed_at - locked_session.paused_at)
  where id = p_session_id
  returning *
  into result;

  return result;
end;
$$;

create or replace function public.end_session(p_session_id uuid, p_ended_early boolean)
returns public.sessions
language plpgsql
security definer
set search_path = public
as $$
declare
  locked_session public.sessions;
  result public.sessions;
begin
  locked_session := public.lock_owned_session(p_session_id);

  if locked_session.status not in ('IN_PROGRESS', 'PAUSED') then
    raise exception using errcode = '22023', message = 'Only active sessions can end';
  end if;

  update public.sessions
  set status = case when p_ended_early then 'ENDED_EARLY' else 'COMPLETED' end,
      ended_at = now(),
      paused_at = null
  where id = p_session_id
  returning *
  into result;

  return result;
end;
$$;
