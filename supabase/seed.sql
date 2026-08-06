-- Deterministic local demo fixtures. Auth users are created by the local Auth service;
-- these rows are inserted only when the matching demo user exists.
do $$
declare demo_user uuid := '00000000-0000-0000-0000-000000000001';
begin
  if exists (select 1 from auth.users where id = demo_user) then
    insert into public.profiles (id, full_name, email) values (demo_user, 'OnTrack Demo', 'demo@ontrack.local') on conflict (id) do nothing;
    insert into public.user_settings (user_id) values (demo_user) on conflict (user_id) do nothing;
    insert into public.deadlines (id, user_id, title, description, due_at, priority, status, progress)
      values ('00000000-0000-0000-0000-000000000010', demo_user, 'Demo deadline', 'Seeded demo plan', now() + interval '14 days', 'HIGH', 'IN_PROGRESS', 40) on conflict (id) do nothing;
    insert into public.milestones (id, deadline_id, title, target_at, progress, status)
      values ('00000000-0000-0000-0000-000000000011', '00000000-0000-0000-0000-000000000010', 'Demo milestone', now() + interval '7 days', 40, 'IN_PROGRESS') on conflict (id) do nothing;
    insert into public.tasks (id, milestone_id, title, priority, status, current_progress)
      values ('00000000-0000-0000-0000-000000000012', '00000000-0000-0000-0000-000000000011', 'Demo task', 'HIGH', 'IN_PROGRESS', 40),
             ('00000000-0000-0000-0000-000000000013', '00000000-0000-0000-0000-000000000011', 'Follow-up task', 'MEDIUM', 'NOT_STARTED', 0)
      on conflict (id) do nothing;
    insert into public.sessions (id, task_id, planned_start_at, estimated_minutes, focus_mode, progress_before)
      values ('00000000-0000-0000-0000-000000000014', '00000000-0000-0000-0000-000000000012', now() + interval '1 hour', 45, 'NORMAL', 40) on conflict (id) do nothing;
  end if;
end $$;
