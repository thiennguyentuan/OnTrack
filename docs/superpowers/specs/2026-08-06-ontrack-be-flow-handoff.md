# OnTrack Backend Flow Handoff

## Purpose

This document defines the backend responsibilities and contracts required to support the approved OnTrack user flow. It is a handoff document for the BE team and the FE team consuming the API.

## Shared product flow

```text
Splash
  → Login/Register
  → Today Dashboard
  → Plans/Deadline List
  → Deadline Detail
  → Milestone Detail
  → Task Detail
  → Plan Session
  → Session Detail
  → Focus Session
  → Post-Session Review
  → Update Progress
  → Follow-up Session or Task Completed
```

## Backend ownership

### 1. Authentication

- Support email/password registration and login through Supabase Auth.
- Return the authenticated user session to FE.
- Enforce authenticated access for all user-owned data.
- Support logout and session refresh.

### 2. Core data hierarchy

```text
User
└── Deadline
    └── Milestone
        └── Task
            └── Session
```

Minimum entities:

- `deadlines`: title, description, due date, status, progress.
- `milestones`: deadline id, title, target date, status, progress.
- `tasks`: milestone id, title, description, priority, status, progress.
- `sessions`: task id, planned start, estimated minutes, status, progress before/after, actual duration, focus mode.
- `notifications`: user id, session id, type, scheduled time, read state.

### 3. Required queries

- `getTodaySessions(userId)`
- `getUpcomingDeadlines(userId)`
- `getDeadline(deadlineId)` with milestones and tasks
- `getTask(taskId)` with session history
- `getSession(sessionId)`
- `getSessionHistory(userId)`
- `getProgressSummary(userId)`
- `getRiskDetails(deadlineId)`

### 4. Required mutations

- `createDeadline`, `updateDeadline`, `deleteDeadline`
- `createMilestone`, `updateMilestone`, `deleteMilestone`
- `createTask`, `updateTask`, `deleteTask`
- `createSession`, `rescheduleSession`, `cancelSession`
- `startSession`, `pauseSession`, `finishSession`
- `completeSessionReview`
- `createFollowUpSession`
- `markNotificationRead`

## Session lifecycle

```text
PLANNED → RUNNING → PAUSED → RUNNING → COMPLETED
                         └────────────→ CANCELLED
```

Rules:

1. A session belongs to exactly one task.
2. `estimatedMinutes` must be greater than zero.
3. Starting a session stores `startedAt` and `expectedEndAt`.
4. Timer truth comes from timestamps, not a client-only counter.
5. A completed or ended session must be reviewed.
6. `progressAfter` cannot be lower than `progressBefore`.
7. A follow-up session is allowed only when task progress is below 100%.
8. When task progress reaches 100%, mark the task completed and do not create a follow-up session.

## Progress and risk

- Task progress comes from the latest reviewed session or explicit task update.
- Milestone progress is calculated from its tasks.
- Deadline progress is calculated from its milestones/tasks according to the approved data model.
- A deadline is overdue when the due date has passed and progress is below 100%.
- Risk output should include the reason, current progress, expected progress, gap, and recommended next action.

## RLS and validation

- Users may only read and mutate records belonging to their own account.
- Child records must be checked against their parent ownership.
- Validate due dates, target dates, session duration, progress range, and lifecycle transitions server-side.
- Review/progress updates should be transactional so task, milestone, and deadline progress cannot become inconsistent.

## FE contract expectations

Every mutation should return the updated resource, or a stable error object with:

```ts
type ApiError = {
  code: string;
  message: string;
  field?: string;
};
```

The BE should provide stable identifiers, ISO timestamps, enum values, and enough data for Today/Plans/Focus/Review without requiring FE to recreate business rules.

## BE acceptance checklist

- Authenticated users cannot access another user's data.
- The complete flow can be executed through API calls from login to reviewed session.
- Starting and resuming a session works after app background/restart.
- Progress and status changes are consistent across Task, Milestone, and Deadline.
- Follow-up creation is blocked for completed tasks.
- Overdue/risk responses explain what the user should do next.

