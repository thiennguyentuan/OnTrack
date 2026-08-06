# OnTrack FE ↔ Supabase API Integration Map

## Purpose

This is the implementation contract for the FE team. It states exactly which Supabase Auth call, table query, or RPC each screen uses, what it receives, and which cached queries must refresh after a successful write.

## Implementation readiness

| Phase | Status | Proven surface | Verification note |
|---|---|---|---|
| Phase 0 — Contract | Ready (code) / Not ready (runtime verification) | Public env contract, typed client, stable `ApiError` normalization | Implementation inspected; Vitest/typecheck blocked because dependencies are not installed (`vitest`/`tsc` unavailable). |
| Phase 1 — Identity | Ready (code) / Not ready (runtime verification) | Auth/profile/settings trigger, owner-only RLS, auth/profile/settings API | Local integration reset is blocked because the Supabase CLI/runtime is unavailable. |
| Phase 2 — Planning | Ready (code) / Not ready (runtime verification) | Deadline/Milestone/Task CRUD, nested RLS, and query hooks | Local integration/typecheck verification pending because Supabase CLI/runtime and dependency linking are unavailable. |
| Phase 3 — Sessions | Ready (code) / Not ready (runtime verification) | Sessions schema/RLS, lifecycle RPCs, session API and query hooks | Local lifecycle integration/typecheck verification pending because Supabase CLI/runtime and dependency linking are unavailable. |
| Phase 4 — Review | Ready (code) / Not ready (runtime verification) | Review/follow-up/dashboard/risk APIs, RPCs, and query hooks | Local review integration/typecheck verification pending because Supabase CLI/runtime and dependency linking are unavailable. |
| Phase 5 — Demo readiness | Not ready | Seed reset and complete demo flow | Pending phase verification. |

## Setup contract

FE receives only these public environment values:

```dotenv
EXPO_PUBLIC_SUPABASE_URL=https://<project-ref>.supabase.co
EXPO_PUBLIC_SUPABASE_ANON_KEY=<anon-key>
```

Initialize the shared typed client from `src/lib/supabase.ts`. Never add the Supabase service-role key to Expo environment files or app code.

All table/RPC failures must be rendered through:

```ts
type ApiError = { code: string; message: string; field?: string };
```

## API conventions

| Item | Contract |
|---|---|
| Authentication | `supabase.auth.*` methods |
| Simple CRUD | `supabase.from('<table>')` methods; RLS scopes rows automatically |
| State transition / multi-table update | `supabase.rpc('<function>', params)` only |
| Timestamps | UTC ISO strings from Supabase; FE formats in `profiles.timezone` |
| Progress/status/risk | read-only except through review RPC; FE never computes canonical values |
| Query keys | `['session', id]`, `['task', id]`, `['deadline', id]`, `['deadlines']`, `['today']`, `['history']`, `['risk', deadlineId]` |

## Authentication screens

| FE screen/action | Supabase call | Input | Success result | FE next step |
|---|---|---|---|---|
| Register | `auth.signUp` via `register()` | `fullName`, `email`, `password` | Auth user/session; profile/settings are trigger-created | Redirect to Today when a session exists; otherwise show email-confirmation state |
| Login | `auth.signInWithPassword` via `login()` | `email`, `password` | `Session` | `router.replace('/(tabs)/today')` |
| App bootstrap | `auth.getSession` and `auth.onAuthStateChange` | none | session/null | Send authenticated users to tabs, others to login |
| Logout | `auth.signOut` via `logout()` | none | no session | Clear QueryClient and `router.replace('/(auth)/login')` |
| Profile/settings | `from('profiles').select().single()` and `from('user_settings').select().single()` | none | current user rows | Render Me screen |

## Plans screens

| FE screen/action | Call | Input | Minimum returned fields | Invalidate/refetch after success |
|---|---|---|---|---|
| Plans list | `from('deadlines').select('id,title,due_at,priority,status,progress,risk_level').order('due_at')` | none | deadline list card data | `['deadlines']` |
| Create Deadline | `from('deadlines').insert(payload).select().single()` | title, description?, due_at, priority | created deadline | `['deadlines']`, `['today']` |
| Edit Deadline | `from('deadlines').update(payload).eq('id', id).select().single()` | editable deadline fields | updated deadline | `['deadline', id]`, `['deadlines']`, `['today']`, `['risk', id]` |
| Delete Deadline | `from('deadlines').delete().eq('id', id)` | deadline id | no content | `['deadlines']`, `['today']` |
| Deadline Detail | `from('deadlines').select('*, milestones(*, tasks(id,title,priority,status,current_progress,position))').eq('id', id).single()` | deadline id | deadline hierarchy | `['deadline', id]` |
| Create Milestone | `from('milestones').insert(payload).select().single()` | deadline_id, title, description?, target_at, position | created milestone | `['deadline', deadline_id]`, `['deadlines']`, `['today']` |
| Edit/Delete Milestone | `from('milestones').update/delete` | milestone id and payload | updated row/no content | parent deadline and lists |
| Task Detail | `from('tasks').select('*, milestones!inner(id,title,deadline_id), sessions(*)').eq('id', id).order('created_at', { foreignTable: 'sessions' })` | task id | task, parent context, sessions | `['task', id]` |
| Create/Edit/Delete Task | `from('tasks').insert/update/delete` | milestone_id and task fields | created/updated row | `['deadline', parentDeadlineId]`, `['task', taskId]`, `['deadlines']`, `['today']` |

### Planning payloads

```ts
type DeadlineInput = {
  title: string;
  description?: string | null;
  due_at: string;
  priority: 'LOW' | 'MEDIUM' | 'HIGH';
};

type MilestoneInput = {
  deadline_id: string;
  title: string;
  description?: string | null;
  target_at: string;
  position?: number;
};

type TaskInput = {
  milestone_id: string;
  title: string;
  description?: string | null;
  priority: 'LOW' | 'MEDIUM' | 'HIGH';
  position?: number;
};
```

## Session, Today, Focus, and Review

| FE screen/action | Call | Input | Success result | Invalidate/refetch after success |
|---|---|---|---|---|
| Plan Session | `from('sessions').insert(payload).select().single()` | task_id, planned_start_at, estimated_minutes, focus_mode, is_follow_up?, previous_session_id? | planned session | `['task', task_id]`, `['today']`, `['history']` |
| Session Detail | `from('sessions').select('*, tasks!inner(id,title,current_progress,milestones!inner(id,deadline_id))').eq('id', id).single()` | session id | session + context | `['session', id]` |
| Today Dashboard | `rpc('get_today_dashboard', { p_now: new Date().toISOString() })` | current time | `sessions`, `next_session`, `risk_card` | `['today']` |
| Start Session | `rpc('start_session', { p_session_id: id })` | session id | session with `status: 'IN_PROGRESS'`, `started_at`, `expected_end_at`, `progress_before` | `['session', id]`, `['task', taskId]`, `['today']` |
| Pause Session | `rpc('pause_session', { p_session_id: id })` | session id | paused session | `['session', id]`, `['today']` |
| Resume Session | `rpc('resume_session', { p_session_id: id })` | session id | in-progress session with updated `expected_end_at` | `['session', id]`, `['today']` |
| End Session | `rpc('end_session', { p_session_id: id, p_ended_early: boolean })` | session id, end mode | ended/completed session | `['session', id]`, `['today']`; route to Review |
| Save Review | `rpc('complete_session_review', params)` | session id, progress_after, actual_minutes, result_note | session, task, milestone, deadline, risk level | `['session', id]`, `['task', taskId]`, `['deadline', deadlineId]`, `['deadlines']`, `['today']`, `['history']`, `['risk', deadlineId]` |
| Follow-up Session | `rpc('create_follow_up_session', params)` | previous session id, planned_start_at, estimated_minutes, focus_mode | planned follow-up session | task, session, today, history keys |
| Session History | `from('sessions').select('*, tasks!inner(title)').in('status', ['COMPLETED','ENDED_EARLY','SKIPPED']).order('ended_at', { ascending: false })` | optional filters | prior session cards | `['history']` |
| Deadline Risk Detail | `rpc('get_deadline_risk', { p_deadline_id: id })` | deadline id | actual/expected/gap/risk/next action | `['risk', id]` |

### Session payloads

```ts
type CreateSessionInput = {
  task_id: string;
  planned_start_at: string;
  estimated_minutes: number;
  focus_mode: 'NORMAL' | 'HIGH';
  is_follow_up?: boolean;
  previous_session_id?: string | null;
};

type ReviewSessionInput = {
  p_session_id: string;
  p_progress_after: number;
  p_actual_minutes: number;
  p_result_note: string | null;
};

type FollowUpSessionInput = {
  p_previous_session_id: string;
  p_planned_start_at: string;
  p_estimated_minutes: number;
  p_focus_mode: 'NORMAL' | 'HIGH';
};
```

## Required response shapes

### `get_today_dashboard`

```ts
type TodayDashboard = {
  sessions: Array<{
    id: string;
    task_id: string;
    task_title: string;
    planned_start_at: string;
    estimated_minutes: number;
    focus_mode: 'NORMAL' | 'HIGH';
    status: 'PLANNED' | 'IN_PROGRESS' | 'PAUSED';
  }>;
  next_session: TodayDashboard['sessions'][number] | null;
  risk_card: {
    deadline_id: string;
    title: string;
    risk_level: 'ON_TRACK' | 'AT_RISK' | 'OVERDUE';
    message: string;
  } | null;
};
```

### `complete_session_review`

```ts
type ReviewResult = {
  session: { id: string; status: 'COMPLETED' | 'ENDED_EARLY'; progress_after: number };
  task: { id: string; current_progress: number; status: 'NOT_STARTED' | 'IN_PROGRESS' | 'COMPLETED' };
  milestone: { id: string; progress: number; status: string };
  deadline: { id: string; progress: number; status: string; risk_level: string };
  can_create_follow_up: boolean;
};
```

## FE responsibilities versus BE responsibilities

| Concern | FE owns | BE owns |
|---|---|---|
| Form feedback | field validation, loading, retry, unsaved-data warning | database validation/error code |
| Authorization | hide unavailable controls | RLS enforcement |
| Timer display | calculate display from `expected_end_at`, app lifecycle UI | canonical timestamps/session status |
| Progress UI | render returned values | validate review and propagate progress |
| Risk UI | show card/message and link | calculate canonical risk and next action |
| Cache | TanStack Query cache and invalidation | return updated resource/RPC result |

## Handoff checklist

- [ ] FE receives Supabase URL and anon key through its local environment, never source control.
- [ ] BE provides generated `Database` types after every schema migration.
- [ ] FE imports API functions/hooks instead of issuing ad-hoc Supabase calls outside feature API modules.
- [ ] Every listed RPC is confirmed in local Supabase before the screen is connected.
- [ ] FE and BE verify the demo path: register → create Deadline → Milestone → Task → Session → start → end → review → follow-up.
- [ ] Notification UI remains behind a demo flag until device-local notification work is available.
