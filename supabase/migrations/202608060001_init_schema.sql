create extension if not exists pgcrypto;

create type public.priority as enum ('LOW', 'MEDIUM', 'HIGH');
create type public.deadline_status as enum ('PLANNING', 'IN_PROGRESS', 'AT_RISK', 'COMPLETED', 'OVERDUE');
create type public.milestone_status as enum ('NOT_STARTED', 'IN_PROGRESS', 'COMPLETED', 'OVERDUE');
create type public.task_status as enum ('NOT_STARTED', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED');
create type public.session_status as enum ('PLANNED', 'IN_PROGRESS', 'PAUSED', 'COMPLETED', 'ENDED_EARLY', 'SKIPPED', 'CANCELLED');
create type public.focus_mode as enum ('NORMAL', 'HIGH');
create type public.risk_level as enum ('ON_TRACK', 'AT_RISK', 'OVERDUE');

create or replace function public.set_updated_at()
returns trigger
language plpgsql
set search_path = public
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create table public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  full_name varchar(100) not null check (length(trim(full_name)) > 0),
  email varchar(255) not null unique,
  timezone varchar(50) not null default 'Asia/Ho_Chi_Minh',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.user_settings (
  user_id uuid primary key references public.profiles(id) on delete cascade,
  daily_focus_minutes integer not null default 120 check (daily_focus_minutes > 0),
  notifications_enabled boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.deadlines (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null default auth.uid() references public.profiles(id) on delete cascade,
  title varchar(150) not null check (length(trim(title)) > 0),
  description text,
  due_at timestamptz not null,
  priority public.priority not null default 'MEDIUM',
  status public.deadline_status not null default 'PLANNING',
  progress numeric(5,2) not null default 0 check (progress >= 0 and progress <= 100),
  risk_level public.risk_level not null default 'ON_TRACK',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.milestones (
  id uuid primary key default gen_random_uuid(),
  deadline_id uuid not null references public.deadlines(id) on delete cascade,
  title varchar(150) not null check (length(trim(title)) > 0),
  description text,
  target_at timestamptz not null,
  status public.milestone_status not null default 'NOT_STARTED',
  progress numeric(5,2) not null default 0 check (progress >= 0 and progress <= 100),
  position integer not null default 0 check (position >= 0),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.tasks (
  id uuid primary key default gen_random_uuid(),
  milestone_id uuid not null references public.milestones(id) on delete cascade,
  title varchar(150) not null check (length(trim(title)) > 0),
  description text,
  priority public.priority not null default 'MEDIUM',
  status public.task_status not null default 'NOT_STARTED',
  current_progress numeric(5,2) not null default 0 check (current_progress >= 0 and current_progress <= 100),
  position integer not null default 0 check (position >= 0),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.sessions (
  id uuid primary key default gen_random_uuid(),
  task_id uuid not null references public.tasks(id) on delete cascade,
  planned_start_at timestamptz not null,
  estimated_minutes integer not null check (estimated_minutes > 0),
  focus_mode public.focus_mode not null default 'NORMAL',
  status public.session_status not null default 'PLANNED',
  progress_before numeric(5,2) not null default 0 check (progress_before >= 0 and progress_before <= 100),
  progress_after numeric(5,2) check (progress_after >= progress_before and progress_after <= 100),
  started_at timestamptz,
  paused_at timestamptz,
  expected_end_at timestamptz,
  ended_at timestamptz,
  actual_minutes integer check (actual_minutes is null or actual_minutes >= 0),
  result_note text,
  exit_count integer not null default 0 check (exit_count >= 0),
  is_follow_up boolean not null default false,
  previous_session_id uuid references public.sessions(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index deadlines_user_due_idx on public.deadlines (user_id, due_at);
create index deadlines_user_status_idx on public.deadlines (user_id, status);
create index milestones_deadline_target_idx on public.milestones (deadline_id, target_at);
create index milestones_deadline_position_idx on public.milestones (deadline_id, position);
create index tasks_milestone_position_idx on public.tasks (milestone_id, position);
create index tasks_milestone_status_idx on public.tasks (milestone_id, status);
create index sessions_task_id_idx on public.sessions (task_id);
create index sessions_planned_start_at_idx on public.sessions (planned_start_at);
create index sessions_status_idx on public.sessions (status);

create or replace function public.enforce_milestone_target_within_deadline()
returns trigger
language plpgsql
set search_path = public
as $$
declare
  deadline_due_at timestamptz;
begin
  select due_at
  into deadline_due_at
  from public.deadlines
  where id = new.deadline_id;

  if deadline_due_at is null then
    return new;
  end if;

  if new.target_at > deadline_due_at then
    raise exception using
      errcode = '23514',
      message = 'milestone target_at must not exceed deadline due_at';
  end if;

  return new;
end;
$$;

create trigger profiles_updated_at
before update on public.profiles
for each row execute function public.set_updated_at();

create trigger settings_updated_at
before update on public.user_settings
for each row execute function public.set_updated_at();

create trigger deadlines_updated_at
before update on public.deadlines
for each row execute function public.set_updated_at();

create trigger milestones_updated_at
before update on public.milestones
for each row execute function public.set_updated_at();

create trigger tasks_updated_at
before update on public.tasks
for each row execute function public.set_updated_at();

create trigger sessions_updated_at
before update on public.sessions
for each row execute function public.set_updated_at();

create trigger milestones_target_within_deadline
before insert or update of deadline_id, target_at on public.milestones
for each row execute function public.enforce_milestone_target_within_deadline();

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, full_name, email)
  values (
    new.id,
    coalesce(nullif(trim(new.raw_user_meta_data ->> 'full_name'), ''), 'OnTrack User'),
    new.email
  );
  insert into public.user_settings (user_id) values (new.id);
  return new;
end;
$$;

create trigger on_auth_user_created
after insert on auth.users
for each row execute function public.handle_new_user();
