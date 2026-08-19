# OnTrack UX Flow Design

## Goal

Align the application flow with the approved wireframe and the product value loop:

`Plan → Execute → Review → Track → Adjust`

## Primary user flow

```text
Splash
  → Login/Register
  → Home/Today Dashboard
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

## Navigation model

Keep the primary bottom navigation as:

- Today: dashboard for today's sessions, upcoming work, risk alerts, and Start/Resume actions.
- Plans: Deadline → Milestone → Task hierarchy and creation flows.
- Me: profile, notifications, focus settings, history, and logout.

Detail and execution screens are stack routes without the tab bar:

- `/deadline/[deadlineId]`
- `/task/[taskId]`
- `/session/plan`
- `/session/[sessionId]`
- `/session/[sessionId]/focus`
- `/session/[sessionId]/review`

## UX rules

1. A new user must authenticate before accessing the main app.
2. Plans is the starting point for creating a Deadline, Milestone, Task, and Session.
3. Today is the execution surface; it must expose Start or Resume for an actionable session.
4. Focus must persist the active session and recover it when the app returns from background or restart.
5. Review is required after a completed or ended session.
6. Review creates a Follow-up Session only when progress is below 100%.
7. Progress updates propagate from Task to Milestone and Deadline.
8. Empty states must provide the next action, especially Create Deadline and Plan Session.

## Implementation order

1. Authentication and route protection.
2. Plans list and Deadline/Milestone/Task creation.
3. Task detail and Plan Session.
4. Today dashboard and Start/Resume actions.
5. Session detail, Focus, and Review.
6. Progress propagation, risk states, history, and notifications.

## Acceptance criteria

- The user can follow the primary flow from authentication to a reviewed session without dead ends.
- Every empty state has a clear next action.
- The bottom tabs remain Today, Plans, and Me.
- Focus and Review routes do not show the bottom tab bar.
- A completed session returns the user to the appropriate progress state, with a follow-up option only when needed.

