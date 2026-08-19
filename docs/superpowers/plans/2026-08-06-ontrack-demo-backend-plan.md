# OnTrack Demo Backend Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Deliver a Supabase-backed MVP that supports authentication, the complete Deadline → Milestone → Task → Session flow, review-driven progress, and a stable API contract for the Expo frontend demo.

**Architecture:** The Expo app calls Supabase using the existing JavaScript client. RLS protects all user-owned rows. Normal CRUD uses table queries; PostgreSQL RPC functions own session lifecycle, review transactions, progress/status propagation, risk calculation, and Today aggregation so FE never recreates business rules.

**Tech Stack:** Supabase Auth, PostgreSQL migrations/RPC/RLS, `@supabase/supabase-js`, TypeScript, Vitest, Expo Router, TanStack Query.

## Global Constraints

- Platform: Android-first Expo/React Native application.
- Auth: Supabase email/password; no service-role key in the mobile app.
- Time values: ISO 8601 UTC timestamps; display timezone comes from `profiles.timezone`.
- Ownership: every row must be protected by RLS; nested resources are authorized through their parent Deadline.
- Progress: clients never directly write Deadline or Milestone progress.
- Timer: `expected_end_at` is the source of truth, never a decrement-only client counter.
- Demo scope: notifications remain device-local and are not a backend dependency.

---

## Phase map

| Phase | Outcome | FE can start using |
|---|---|---|
| 0. Contract | Supabase config, generated types, error convention | env and typed client |
| 1. Identity | Register, login, logout, profile/settings | auth screens and protected navigation |
| 2. Planning | Deadline, milestone, task CRUD under RLS | Plans and detail screens |
| 3. Sessions | Create, list, start/pause/resume/end a session | Plan Session, Today, Focus |
| 4. Review | Atomic review, progress/status/risk, follow-up | Review and progress UI |
| 5. Demo readiness | seed data, integration tests, handoff verification | end-to-end demo |

## File map

| Path | Responsibility |
|---|---|
| `supabase/config.toml` | Supabase local project configuration |
| `supabase/migrations/202608060001_init_schema.sql` | enums, tables, constraints, indexes, timestamps |
| `supabase/migrations/202608060002_rls.sql` | RLS enablement and ownership policies |
| `supabase/migrations/202608060003_domain_rpc.sql` | session lifecycle, review, follow-up, dashboard and risk functions |
| `supabase/seed.sql` | deterministic demo account data |
| `src/lib/supabase.ts` | singleton typed mobile Supabase client |
| `src/types/database.ts` | generated Supabase `Database` types |
| `src/features/auth/api.ts` | Auth/profile/settings calls |
| `src/features/plans/api.ts` | deadline, milestone and task CRUD calls |
| `src/features/sessions/api.ts` | session CRUD and RPC calls |
| `src/features/dashboard/api.ts` | Today, history and risk reads |
| `src/features/**/queries.ts` | TanStack Query hooks and invalidation rules |
| `src/lib/api-error.ts` | stable FE-facing error normalization |
| `tests/domain/*.test.ts` | pure domain-rule tests |
| `tests/integration/*.test.ts` | Supabase local integration checks |

### Task 1: Phase 0 — Configure Supabase and typed client

**Files:**
- Create: `supabase/config.toml`
- Create: `src/lib/supabase.ts`
- Create: `src/lib/api-error.ts`
- Create: `src/types/database.ts`
- Modify: `.env.example`
- Modify: `package.json`
- Test: `tests/domain/api-error.test.ts`

**Consumes:** Existing Expo app and `@supabase/supabase-js` dependency.

**Produces:** `supabase`, `normalizeApiError(error)`, and a `Database` type usable by all feature APIs.

- [ ] **Step 1: Add Vitest scripts and a failing error-normalization test.**

```ts
import { describe, expect, it } from 'vitest';
import { normalizeApiError } from '../../src/lib/api-error';

describe('normalizeApiError', () => {
  it('returns a stable message and code for a Postgrest error', () => {
    expect(normalizeApiError({ code: '23505', message: 'duplicate key value' })).toEqual({
      code: '23505', message: 'duplicate key value', field: undefined,
    });
  });
});
```

- [ ] **Step 2: Run the test to verify RED.**

Run: `pnpm exec vitest run tests/domain/api-error.test.ts`  
Expected: FAIL because `src/lib/api-error.ts` does not exist.

- [ ] **Step 3: Implement the minimal typed client and error normalization.**

```ts
export type ApiError = { code: string; message: string; field?: string };
export function normalizeApiError(error: { code?: string; message?: string } | null): ApiError {
  return { code: error?.code ?? 'UNKNOWN', message: error?.message ?? 'Something went wrong' };
}
```

`src/lib/supabase.ts` must construct `createClient<Database>(EXPO_PUBLIC_SUPABASE_URL, EXPO_PUBLIC_SUPABASE_ANON_KEY)` and throw on missing public environment values.

- [ ] **Step 4: Run the unit test and typecheck.**

Run: `pnpm exec vitest run tests/domain/api-error.test.ts; pnpm run typecheck`  
Expected: PASS, then TypeScript exits 0.

- [ ] **Step 5: Commit.**

```bash
git add package.json pnpm-lock.yaml .env.example src/lib src/types tests/domain/api-error.test.ts supabase/config.toml
git commit -m "chore: configure typed Supabase client"
```

### Task 2: Phase 1 — Create identity, profile, and settings schema with RLS

**Files:**
- Create: `supabase/migrations/202608060001_init_schema.sql`
- Create: `supabase/migrations/202608060002_rls.sql`
- Create: `src/features/auth/api.ts`
- Test: `tests/integration/auth-rls.test.ts`

**Consumes:** `supabase`, `Database`, and `normalizeApiError` from Task 1.

**Produces:** `profiles`, `user_settings`, auth helpers, and policies that prevent cross-user reads/writes.

- [ ] **Step 1: Write failing local integration tests for profile creation and isolation.**

```ts
it('creates a profile for the registered user', async () => {
  const { data } = await userA.from('profiles').select('id,email').eq('id', userAId).single();
  expect(data?.id).toBe(userAId);
});

it('does not expose user B profile through user A credentials', async () => {
  const { data } = await userA.from('profiles').select('id').eq('id', userBId);
  expect(data).toEqual([]);
});
```

- [ ] **Step 2: Run tests against Supabase local to verify RED.**

Run: `supabase start; pnpm exec vitest run tests/integration/auth-rls.test.ts`  
Expected: FAIL because tables/policies do not exist.

- [ ] **Step 3: Create migration with profile/settings trigger, constraints, and policies.**

Implement:

```sql
create table public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  full_name varchar(100) not null,
  email varchar(255) not null unique,
  timezone varchar(50) not null default 'Asia/Ho_Chi_Minh',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
alter table public.profiles enable row level security;
create policy "profile owner" on public.profiles for all using (id = auth.uid()) with check (id = auth.uid());
```

Create `user_settings` one-to-one with `profiles`; add an `auth.users` insert trigger that creates both rows.

- [ ] **Step 4: Implement auth functions.**

Export `register({ fullName, email, password })`, `login({ email, password })`, `logout()`, `getCurrentSession()`, `getProfile()`, and `updateSettings(input)` from `src/features/auth/api.ts`.

- [ ] **Step 5: Re-run integration tests and typecheck.**

Run: `supabase db reset; pnpm exec vitest run tests/integration/auth-rls.test.ts; pnpm run typecheck`  
Expected: all commands exit 0.

- [ ] **Step 6: Commit.**

```bash
git add supabase/migrations src/features/auth tests/integration/auth-rls.test.ts
git commit -m "feat: add Supabase auth profiles and settings"
```

### Task 3: Phase 2 — Create planning schema, RLS, and CRUD APIs

**Files:**
- Modify: `supabase/migrations/202608060001_init_schema.sql`
- Modify: `supabase/migrations/202608060002_rls.sql`
- Create: `src/features/plans/api.ts`
- Create: `src/features/plans/queries.ts`
- Test: `tests/integration/plans-rls.test.ts`

**Consumes:** identity tables and typed client from Tasks 1–2.

**Produces:** `deadlines`, `milestones`, `tasks`, direct CRUD APIs, and `useDeadlinesQuery`, `useDeadlineQuery`, `useTaskQuery` hooks.

- [ ] **Step 1: Write failing tests for hierarchy ownership and parent-date constraints.**

```ts
it('rejects a milestone whose target date exceeds its deadline due date', async () => {
  const { error } = await userA.from('milestones').insert({
    deadline_id: deadlineId, title: 'Late milestone', target_at: '2031-01-02T00:00:00Z',
  });
  expect(error?.code).toBe('23514');
});

it('prevents another user from reading a deadline hierarchy', async () => {
  const { data } = await userB.from('deadlines').select('id').eq('id', deadlineId);
  expect(data).toEqual([]);
});
```

- [ ] **Step 2: Run integration tests to verify RED.**

Run: `pnpm exec vitest run tests/integration/plans-rls.test.ts`  
Expected: FAIL because planning tables and policies do not exist.

- [ ] **Step 3: Add tables, enums, indexes, constraints, and nested RLS policies.**

Use these enum values:

```sql
create type public.priority as enum ('LOW','MEDIUM','HIGH');
create type public.deadline_status as enum ('PLANNING','IN_PROGRESS','AT_RISK','COMPLETED','OVERDUE');
create type public.milestone_status as enum ('NOT_STARTED','IN_PROGRESS','COMPLETED','OVERDUE');
create type public.task_status as enum ('NOT_STARTED','IN_PROGRESS','COMPLETED','CANCELLED');
```

Add `deadlines.user_id default auth.uid()`, child foreign keys with `on delete cascade`, due/target date checks, and policies that use `exists` against the parent chain.

- [ ] **Step 4: Implement typed CRUD and cache hooks.**

Export `listDeadlines`, `getDeadline`, `createDeadline`, `updateDeadline`, `deleteDeadline`, `createMilestone`, `updateMilestone`, `deleteMilestone`, `createTask`, `updateTask`, and `deleteTask`.

`useCreateTaskMutation` must invalidate `['deadline', deadlineId]`, `['task', taskId]` when relevant, `['deadlines']`, and `['today']`.

- [ ] **Step 5: Re-run tests and typecheck.**

Run: `supabase db reset; pnpm exec vitest run tests/integration/plans-rls.test.ts; pnpm run typecheck`  
Expected: all commands exit 0.

- [ ] **Step 6: Commit.**

```bash
git add supabase/migrations src/features/plans tests/integration/plans-rls.test.ts
git commit -m "feat: add planning hierarchy APIs"
```

### Task 4: Phase 3 — Add sessions and lifecycle RPC functions

**Files:**
- Modify: `supabase/migrations/202608060001_init_schema.sql`
- Create: `supabase/migrations/202608060003_domain_rpc.sql`
- Create: `src/features/sessions/api.ts`
- Create: `src/features/sessions/queries.ts`
- Test: `tests/integration/session-lifecycle.test.ts`

**Consumes:** task hierarchy from Task 3.

**Produces:** `sessions`, `createSession`, `startSession`, `pauseSession`, `resumeSession`, `endSession`, `getTodaySessions`, and `getSession`.

- [ ] **Step 1: Write failing lifecycle tests.**

```ts
it('starts a planned session using the task current progress', async () => {
  const { data, error } = await user.rpc('start_session', { p_session_id: sessionId });
  expect(error).toBeNull();
  expect(data.status).toBe('IN_PROGRESS');
  expect(data.progress_before).toBe(40);
  expect(data.expected_end_at).not.toBeNull();
});

it('rejects starting a non-planned session', async () => {
  const { error } = await user.rpc('start_session', { p_session_id: startedSessionId });
  expect(error?.message).toContain('PLANNED');
});
```

- [ ] **Step 2: Run test to verify RED.**

Run: `pnpm exec vitest run tests/integration/session-lifecycle.test.ts`  
Expected: FAIL because the sessions table and RPC function do not exist.

- [ ] **Step 3: Add schema and lifecycle RPC functions.**

Create `session_status` enum: `PLANNED`, `IN_PROGRESS`, `PAUSED`, `COMPLETED`, `ENDED_EARLY`, `SKIPPED`, `CANCELLED`.

Implement `start_session(p_session_id uuid)`, `pause_session(p_session_id uuid)`, `resume_session(p_session_id uuid)`, and `end_session(p_session_id uuid, p_ended_early boolean)`. Each function must authorize through the Deadline owner, lock the session row with `for update`, enforce the allowed previous state, and return the updated `sessions` row.

- [ ] **Step 4: Implement FE-facing session API and hooks.**

Export `createSession`, `getSession`, `getTodaySessions`, `startSession`, `pauseSession`, `resumeSession`, `endSession`, `rescheduleSession`, and `cancelSession`.

Each session mutation invalidates `['session', sessionId]`, `['task', taskId]`, `['today']`, and `['history']` where applicable.

- [ ] **Step 5: Re-run lifecycle tests and typecheck.**

Run: `supabase db reset; pnpm exec vitest run tests/integration/session-lifecycle.test.ts; pnpm run typecheck`  
Expected: all commands exit 0.

- [ ] **Step 6: Commit.**

```bash
git add supabase/migrations src/features/sessions tests/integration/session-lifecycle.test.ts
git commit -m "feat: add focus session lifecycle"
```

### Task 5: Phase 4 — Implement atomic review, progress, risk, and follow-up

**Files:**
- Modify: `supabase/migrations/202608060003_domain_rpc.sql`
- Create: `src/features/dashboard/api.ts`
- Create: `src/features/dashboard/queries.ts`
- Test: `tests/integration/session-review.test.ts`

**Consumes:** session lifecycle from Task 4.

**Produces:** `complete_session_review`, `create_follow_up_session`, `get_today_dashboard`, `get_deadline_risk`, and read hooks for Today/history/risk.

- [ ] **Step 1: Write failing transaction tests.**

```ts
it('review updates session, task, milestone and deadline in one call', async () => {
  const { error } = await user.rpc('complete_session_review', {
    p_session_id: sessionId, p_progress_after: 40, p_actual_minutes: 45, p_result_note: 'First pass',
  });
  expect(error).toBeNull();
  expect(await getTaskProgress(taskId)).toBe(40);
  expect(await getMilestoneProgress(milestoneId)).toBe(40);
  expect(await getDeadlineProgress(deadlineId)).toBe(40);
});

it('rejects progress lower than session progress_before', async () => {
  const { error } = await user.rpc('complete_session_review', {
    p_session_id: sessionId, p_progress_after: 10, p_actual_minutes: 45, p_result_note: null,
  });
  expect(error?.message).toContain('progress_after');
});
```

- [ ] **Step 2: Run test to verify RED.**

Run: `pnpm exec vitest run tests/integration/session-review.test.ts`  
Expected: FAIL because review and recalculation RPCs do not exist.

- [ ] **Step 3: Implement review transaction and progress/risk helpers.**

`complete_session_review` must lock the session/task/milestone/deadline rows, validate `progress_after` is between `progress_before` and 100, set session final values, set task status from progress, recompute milestone average task progress, recompute deadline average milestone progress, and return all updated resources plus `risk_level`.

`create_follow_up_session` must reject completed tasks, set `is_follow_up = true`, set `previous_session_id`, and use the task current progress as `progress_before`.

- [ ] **Step 4: Add dashboard and risk reads.**

Implement `get_today_dashboard(p_now timestamptz default now())` returning today's actionable sessions, the next planned session, and at most one highest-priority risk card. Implement `get_deadline_risk(p_deadline_id uuid)` returning actual progress, expected progress, gap, risk level, and next action text.

- [ ] **Step 5: Re-run review tests and typecheck.**

Run: `supabase db reset; pnpm exec vitest run tests/integration/session-review.test.ts; pnpm run typecheck`  
Expected: all commands exit 0.

- [ ] **Step 6: Commit.**

```bash
git add supabase/migrations src/features/dashboard tests/integration/session-review.test.ts
git commit -m "feat: add session review progress and risk"
```

### Task 6: Phase 5 — Seed demo data and verify the full flow

**Files:**
- Create: `supabase/seed.sql`
- Create: `tests/integration/demo-flow.test.ts`
- Modify: `docs/superpowers/specs/2026-08-06-ontrack-fe-api-integration.md`

**Consumes:** all schema, APIs, and RPCs from Tasks 1–5.

**Produces:** a resettable demo environment and a verified FE handoff.

- [ ] **Step 1: Write the failing demo-flow test.**

```ts
it('runs the demo from registration to a follow-up session', async () => {
  const ids = await registerAndCreateDeadlineMilestoneTask(user);
  const session = await createSessionForTask(ids.taskId, 45);
  await startSession(session.id);
  await endSession(session.id, true);
  const review = await reviewSession(session.id, 40);
  const followUp = await createFollowUp(review.session.id, tomorrow);
  expect(followUp.progress_before).toBe(40);
});
```

- [ ] **Step 2: Run the end-to-end integration test to verify RED.**

Run: `pnpm exec vitest run tests/integration/demo-flow.test.ts`  
Expected: FAIL until all previously planned APIs/RPCs are wired together.

- [ ] **Step 3: Add deterministic seed data.**

Seed one demo user through local Supabase seed support, one active Deadline, one Milestone, two Tasks, one planned Session, and one reviewed Session. Use fixed UUIDs and future dates relative to the demo date fixture.

- [ ] **Step 4: Make the full test green and verify a reset.**

Run: `supabase db reset; pnpm exec vitest run tests/integration/demo-flow.test.ts; pnpm run typecheck`  
Expected: all commands exit 0 and seed data is restored after reset.

- [ ] **Step 5: Mark each verified FE operation as ready in the API integration document.**

Set only operations proven by the integration suite to `Ready`; leave future notification operations outside demo scope.

- [ ] **Step 6: Commit.**

```bash
git add supabase/seed.sql tests/integration/demo-flow.test.ts docs/superpowers/specs/2026-08-06-ontrack-fe-api-integration.md
git commit -m "test: verify complete demo backend flow"
```

## Plan self-review

- Coverage: Auth, Supabase setup, RLS, all planning CRUD, session lifecycle, review/progress/risk, seed data, integration tests, and FE handoff each map to Tasks 1–6.
- Scope: Device notifications, analytics, offline synchronization, and production observability are excluded from the demo backend plan.
- Consistency: All session RPC names and cache keys match the FE API integration document.

