# OnTrack Frontend Flow Handoff

## Purpose

This document defines the screens, navigation, user actions, and backend data required by the FE team. It follows the same UX contract as the BE handoff.

## Primary navigation

Keep the bottom tabs:

- `Today`: execute today's work.
- `Plans`: manage Deadline → Milestone → Task.
- `Me`: profile, notifications, focus settings, history, and logout.

Detail and execution screens should not show the bottom tab bar.

## User flow

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

## Screen responsibilities

### Auth

- Login, Register, and Logout.
- Show loading, validation, and server error states.
- Redirect authenticated users to Today.
- Redirect unauthenticated users away from protected routes.

### Today

- Show today's sessions grouped by status/time.
- Show Start for planned sessions and Resume for active sessions.
- Show upcoming deadline and risk summary.
- Provide an empty state with a clear action to create a plan or session.

### Plans

- List deadlines with progress, due date, and risk status.
- Provide Add Deadline CTA.
- Open Deadline Detail.
- Allow creating milestones and tasks inside the correct parent.

### Deadline/Milestone/Task detail

- Show hierarchy context and back navigation.
- Show progress and status.
- Provide edit/delete actions with confirmation.
- Task Detail shows session history and Plan Next Session CTA.

### Plan Session

- Select task, date, time, duration, focus mode, and optional note.
- Validate required fields before submit.
- On success, return to Session Detail or Today with the new session visible.

### Session Detail

- Show task, planned time, duration, focus mode, and progress before.
- Provide Start Session, Edit, Reschedule, and Cancel actions.

### Focus Session

- Show timer based on `expectedEndAt`.
- Support pause, resume, and end early.
- Persist/recover the active session when the app backgrounds or restarts.
- Do not allow navigation to silently discard an active session.

### Post-Session Review

- Show session summary and progress before.
- Capture progress after, actual duration, and note/result.
- Save review and update progress.
- Offer Follow-up Session only when progress is below 100%.
- Show Task Completed state when progress reaches 100%.

### Me

- Profile/account.
- Notification settings.
- Focus mode settings.
- Session history.
- Logout.

## Route map

```text
/                         → redirect based on auth state
/(auth)/login             → Login
/(auth)/register          → Register
/(tabs)/today             → Today
/(tabs)/plans             → Plans
/(tabs)/me                → Me
/deadline/[deadlineId]    → Deadline Detail
/task/[taskId]            → Task Detail
/session/plan             → Plan Session
/session/[sessionId]      → Session Detail
/session/[sessionId]/focus → Focus Session
/session/[sessionId]/review → Post-Session Review
```

## FE data/state rules

- Use BE values for status, progress, risk, and timestamps.
- Use query state for remote entities and invalidate related queries after mutations.
- Use a small persisted local store only for the active-session snapshot.
- Calculate remaining time from timestamps, not from a decrementing counter.
- Handle loading, empty, error, success, offline, and expired-session states for every data screen.

## Error and recovery UX

- Inline field errors for validation failures.
- Toast/banner for recoverable server errors.
- Retry action for failed reads.
- Preserve entered form data when a mutation fails.
- Confirm destructive actions.
- If a session has expired while the app was closed, route to Review instead of showing a negative timer.

## FE acceptance checklist

- A new user can register/login and reach Today.
- A user can create Deadline → Milestone → Task → Session from Plans.
- Today exposes Start/Resume for actionable sessions.
- Focus survives background/restart and leads to Review.
- Review updates progress and shows the correct follow-up/completed state.
- Back navigation preserves context and never drops unsaved form data silently.

