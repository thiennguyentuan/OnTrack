create extension if not exists pgcrypto;

create table if not exists users (
  id uuid primary key default gen_random_uuid(),
  email varchar(255) not null unique,
  password_hash text not null,
  full_name varchar(100) not null,
  timezone varchar(50) not null default 'Asia/Ho_Chi_Minh',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists deadlines (
  id uuid primary key default gen_random_uuid(), user_id uuid not null references users(id) on delete cascade,
  title varchar(200) not null, description text, due_at timestamptz not null,
  priority varchar(10) not null default 'MEDIUM' check (priority in ('LOW','MEDIUM','HIGH')),
  status varchar(20) not null default 'PLANNING', progress numeric(5,2) not null default 0 check (progress between 0 and 100),
  risk_level varchar(20) not null default 'ON_TRACK', created_at timestamptz not null default now(), updated_at timestamptz not null default now()
);

create table if not exists milestones (
  id uuid primary key default gen_random_uuid(), deadline_id uuid not null references deadlines(id) on delete cascade,
  title varchar(200) not null, description text, target_at timestamptz not null, position integer not null default 0,
  status varchar(20) not null default 'NOT_STARTED', progress numeric(5,2) not null default 0 check (progress between 0 and 100),
  created_at timestamptz not null default now(), updated_at timestamptz not null default now()
);

create table if not exists tasks (
  id uuid primary key default gen_random_uuid(), milestone_id uuid not null references milestones(id) on delete cascade,
  title varchar(200) not null, description text, priority varchar(10) not null default 'MEDIUM' check (priority in ('LOW','MEDIUM','HIGH')),
  position integer not null default 0, status varchar(20) not null default 'NOT_STARTED', current_progress numeric(5,2) not null default 0 check (current_progress between 0 and 100),
  created_at timestamptz not null default now(), updated_at timestamptz not null default now()
);

create table if not exists sessions (
  id uuid primary key default gen_random_uuid(), task_id uuid not null references tasks(id) on delete cascade,
  planned_start_at timestamptz not null, estimated_minutes integer not null check (estimated_minutes > 0),
  focus_mode varchar(10) not null default 'NORMAL' check (focus_mode in ('NORMAL','HIGH')),
  status varchar(20) not null default 'PLANNED', progress_before numeric(5,2) not null default 0,
  progress_after numeric(5,2), started_at timestamptz, paused_at timestamptz, expected_end_at timestamptz, ended_at timestamptz,
  actual_minutes integer, result_note text, is_follow_up boolean not null default false, previous_session_id uuid references sessions(id) on delete set null,
  created_at timestamptz not null default now(), updated_at timestamptz not null default now()
);

create index if not exists deadlines_user_due_idx on deadlines(user_id, due_at);
create index if not exists milestones_deadline_idx on milestones(deadline_id);
create index if not exists tasks_milestone_idx on tasks(milestone_id);
create index if not exists sessions_task_idx on sessions(task_id, planned_start_at);
