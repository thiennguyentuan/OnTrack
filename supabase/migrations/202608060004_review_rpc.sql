-- Forward-compatible RPC migration for databases that already applied 001-003.
create or replace function public.complete_session_review(p_session_id uuid, p_progress_after numeric, p_actual_minutes integer, p_result_note text)
returns jsonb language plpgsql security definer set search_path = public as $$
declare s public.sessions; t public.tasks; m public.milestones; d public.deadlines; mp numeric; dp numeric; risk public.risk_level;
begin
  s := public.assert_session_owner(p_session_id);
  if s.status not in ('COMPLETED','ENDED_EARLY') then raise exception using errcode='22023', message='Session must be ended before review'; end if;
  if p_progress_after < s.progress_before or p_progress_after > 100 then raise exception using errcode='22023', message='progress_after must be between progress_before and 100'; end if;
  update public.sessions set progress_after=p_progress_after, actual_minutes=p_actual_minutes, result_note=p_result_note where id=p_session_id returning * into s;
  update public.tasks set current_progress=p_progress_after, status=case when p_progress_after=100 then 'COMPLETED' when p_progress_after>0 then 'IN_PROGRESS' else 'NOT_STARTED' end where id=s.task_id returning * into t;
  select m0.* into m from public.milestones m0 where m0.id=(select milestone_id from public.tasks where id=t.id) for update;
  select coalesce(avg(current_progress),0) into mp from public.tasks where milestone_id=m.id;
  update public.milestones set progress=mp, status=case when mp=100 then 'COMPLETED' when mp>0 then 'IN_PROGRESS' else 'NOT_STARTED' end where id=m.id returning * into m;
  select d0.* into d from public.deadlines d0 where d0.id=m.deadline_id for update;
  select coalesce(avg(progress),0) into dp from public.milestones where deadline_id=d.id;
  risk := case when d.due_at < now() and dp < 100 then 'OVERDUE' when dp < greatest(0, least(100, 100 - extract(epoch from (d.due_at-now())) / 86400 * 2)) then 'AT_RISK' else 'ON_TRACK' end;
  update public.deadlines set progress=dp, status=case when dp=100 then 'COMPLETED' when risk='OVERDUE' then 'OVERDUE' when risk='AT_RISK' then 'AT_RISK' else 'IN_PROGRESS' end, risk_level=risk where id=d.id returning * into d;
  return jsonb_build_object('session',to_jsonb(s),'task',to_jsonb(t),'milestone',to_jsonb(m),'deadline',to_jsonb(d),'can_create_follow_up',p_progress_after<100);
end $$;

create or replace function public.create_follow_up_session(p_previous_session_id uuid, p_planned_start_at timestamptz, p_estimated_minutes integer, p_focus_mode public.focus_mode)
returns public.sessions language plpgsql security definer set search_path=public as $$
declare old_session public.sessions; task_progress numeric; result public.sessions;
begin
  old_session := public.assert_session_owner(p_previous_session_id);
  select current_progress into task_progress from public.tasks where id=old_session.task_id for update;
  if task_progress >= 100 then raise exception using errcode='22023', message='Cannot create follow-up for a completed task'; end if;
  insert into public.sessions(task_id, planned_start_at, estimated_minutes, focus_mode, is_follow_up, previous_session_id, progress_before)
    values(old_session.task_id,p_planned_start_at,p_estimated_minutes,p_focus_mode,true,p_previous_session_id,task_progress) returning * into result;
  return result;
end $$;

create or replace function public.get_deadline_risk(p_deadline_id uuid) returns jsonb language plpgsql security definer set search_path=public as $$
declare d public.deadlines; expected numeric; gap numeric;
begin
  select * into d from public.deadlines where id=p_deadline_id and user_id=auth.uid();
  if d.id is null then raise exception using errcode='42501',message='Deadline is not accessible'; end if;
  expected := greatest(0,least(100,100-(extract(epoch from (d.due_at-now()))/86400*2))); gap := d.progress-expected;
  return jsonb_build_object('deadline_id',d.id,'actual_progress',d.progress,'expected_progress',expected,'gap',gap,'risk_level',d.risk_level,'next_action',case when d.risk_level='OVERDUE' then 'Schedule an urgent focus session' when d.risk_level='AT_RISK' then 'Complete the next planned task' else 'Keep the planned schedule' end);
end $$;

create or replace function public.get_today_dashboard(p_now timestamptz default now()) returns jsonb language plpgsql security definer set search_path=public as $$
declare sessions jsonb; next_session jsonb; risk_card jsonb;
begin
  select coalesce(jsonb_agg(to_jsonb(x) order by x.planned_start_at),'[]'::jsonb) into sessions from (select s.id,s.task_id,t.title task_title,s.planned_start_at,s.estimated_minutes,s.focus_mode,s.status from public.sessions s join public.tasks t on t.id=s.task_id join public.milestones m on m.id=t.milestone_id join public.deadlines d on d.id=m.deadline_id where d.user_id=auth.uid() and s.planned_start_at::date=p_now::date and s.status in ('PLANNED','IN_PROGRESS','PAUSED')) x;
  select to_jsonb(x) into next_session from (select s.id,s.task_id,t.title task_title,s.planned_start_at,s.estimated_minutes,s.focus_mode,s.status from public.sessions s join public.tasks t on t.id=s.task_id join public.milestones m on m.id=t.milestone_id join public.deadlines d on d.id=m.deadline_id where d.user_id=auth.uid() and s.planned_start_at>=p_now and s.status='PLANNED' order by s.planned_start_at limit 1) x;
  select jsonb_build_object('deadline_id',id,'title',title,'risk_level',risk_level,'message',case when risk_level='OVERDUE' then 'Deadline is overdue' else 'Deadline needs attention' end) into risk_card from public.deadlines where user_id=auth.uid() and risk_level in ('AT_RISK','OVERDUE') order by due_at limit 1;
  return jsonb_build_object('sessions',sessions,'next_session',coalesce(next_session,'null'::jsonb),'risk_card',coalesce(risk_card,'null'::jsonb));
end $$;
