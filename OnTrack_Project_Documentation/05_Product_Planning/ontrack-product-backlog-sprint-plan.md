# OnTrack — Product Backlog, User Stories & Sprint Plan

## 1. Product Goal

Xây dựng ứng dụng mobile OnTrack giúp sinh viên:

- Tạo và quản lý deadline.
- Chia deadline thành milestone và task.
- Lên lịch focus session.
- Theo dõi tiến độ thực tế sau mỗi session.
- Phát hiện sớm nguy cơ trễ hạn.
- Biết rõ hôm nay cần làm gì tiếp theo.

Core flow:

```text
Plan → Execute → Review → Track → Adjust
```

---

## 2. Epic Overview

```text
Epic 1 — Project Foundation
Epic 2 — Authentication
Epic 3 — Deadline Planning
Epic 4 — Milestone & Task Management
Epic 5 — Session Planning
Epic 6 — Focus Session Execution
Epic 7 — Post-Session Review
Epic 8 — Progress & Risk
Epic 9 — Notifications & Settings
Epic 10 — Testing & Release
```

---

# 3. Product Backlog

## Epic 1 — Project Foundation

### US-001 — Initialize Flutter project

**As a developer,**  
I want a structured Flutter project  
so that future features are maintainable.

#### Acceptance Criteria

- Flutter project builds successfully on Android.
- Riverpod is configured.
- GoRouter is configured.
- Supabase client is initialized.
- Environment variables are separated from source code.
- Folder structure follows agreed architecture.
- Basic theme and reusable layout components exist.

Priority: Must Have  
Estimate: 3 points

---

### US-002 — Create global theme

**As a user,**  
I want the interface to be visually consistent  
so that the app feels simple and trustworthy.

#### Acceptance Criteria

- Primary, secondary, warning, error and success colors exist.
- Typography scale is defined.
- Button styles are reusable.
- Card, input and bottom-sheet styles are reusable.
- Theme matches the approved bright OnTrack direction.

Priority: Must Have  
Estimate: 2 points

---

### US-003 — Configure app navigation

**As a user,**  
I want to move between Today, Plans and Me  
so that I can access the app’s main areas easily.

#### Acceptance Criteria

- Bottom navigation contains exactly Today, Plans and Me.
- Selected tab remains highlighted.
- Tab state is preserved when switching.
- Authentication screens do not show bottom navigation.
- Focus Session does not show bottom navigation.
- Android back behavior works correctly.

Priority: Must Have  
Estimate: 3 points

---

## Epic 2 — Authentication

### US-004 — Register account

**As a new user,**  
I want to create an account  
so that I can save my plans.

#### Acceptance Criteria

- User can enter full name, email and password.
- Invalid email is rejected.
- Weak or invalid password shows a clear message.
- Duplicate email shows an error.
- Successful registration creates a profile.
- User is redirected to Today or Login after success.

Priority: Must Have  
Estimate: 3 points

---

### US-005 — Login

**As a registered user,**  
I want to log in  
so that I can access my OnTrack data.

#### Acceptance Criteria

- User can log in using email and password.
- Invalid credentials show a friendly error.
- Loading state is shown during login.
- Successful login redirects to Today.
- Session remains available after reopening the app.

Priority: Must Have  
Estimate: 3 points

---

### US-006 — Logout

**As a user,**  
I want to log out  
so that my account is secure.

#### Acceptance Criteria

- Logout action is available in Me.
- Confirmation is shown before logout.
- Auth tokens are removed.
- User is redirected to Login.
- Protected screens cannot be reopened without authentication.

Priority: Must Have  
Estimate: 1 point

---

## Epic 3 — Deadline Planning

### US-007 — View deadline list

**As a user,**  
I want to see all my deadlines  
so that I know what I am working toward.

#### Acceptance Criteria

- Plans screen lists active deadlines.
- Deadline card shows title, progress, due date and status.
- Empty state is shown when no deadline exists.
- User can filter Active, At Risk and Completed.
- Only the current user’s deadlines are visible.

Priority: Must Have  
Estimate: 3 points

---

### US-008 — Create deadline

**As a user,**  
I want to create a deadline  
so that I can begin planning a goal.

#### Acceptance Criteria

- User can enter title, description, due date and priority.
- Title and due date are required.
- Due date must be in the future.
- Save creates the deadline.
- New deadline starts with 0% progress.
- Success returns the user to Deadline Detail or Plans.

Priority: Must Have  
Estimate: 3 points

---

### US-009 — Edit deadline

**As a user,**  
I want to edit a deadline  
so that I can correct or update my plan.

#### Acceptance Criteria

- Existing values are prefilled.
- User can update title, description, due date and priority.
- Invalid dates are rejected.
- Changes are reflected immediately after save.

Priority: Must Have  
Estimate: 2 points

---

### US-010 — Delete deadline

**As a user,**  
I want to delete a deadline  
so that obsolete plans do not remain in the app.

#### Acceptance Criteria

- Delete requires confirmation.
- Warning explains that milestones, tasks and sessions will also be deleted.
- Confirming deletes the full hierarchy.
- Cancelling keeps all data unchanged.

Priority: Must Have  
Estimate: 2 points

---

## Epic 4 — Milestone & Task Management

### US-011 — Add milestone

**As a user,**  
I want to divide a deadline into milestones  
so that large goals become easier to manage.

#### Acceptance Criteria

- User can enter milestone title and target date.
- Target date cannot exceed deadline due date.
- New milestone appears inside Deadline Detail.
- New milestone starts at 0% progress.

Priority: Must Have  
Estimate: 3 points

---

### US-012 — Edit or delete milestone

**As a user,**  
I want to update milestone information  
so that my plan stays accurate.

#### Acceptance Criteria

- User can edit milestone title and target date.
- User can delete a milestone after confirmation.
- Deleting a milestone removes its tasks and sessions.
- Deadline progress recalculates after deletion.

Priority: Must Have  
Estimate: 2 points

---

### US-013 — View tasks inside milestones

**As a user,**  
I want to see tasks grouped by milestone  
so that the plan remains understandable.

#### Acceptance Criteria

- Milestones appear as expandable sections.
- Expanding a milestone reveals its tasks.
- Task row shows title, progress and status.
- Completed tasks show a completion indicator.
- Partial tasks show progress rather than an unchecked checkbox.

Priority: Must Have  
Estimate: 3 points

---

### US-014 — Create task

**As a user,**  
I want to create a task inside a milestone  
so that I can define concrete work.

#### Acceptance Criteria

- User can enter title, description and priority.
- Task belongs to one milestone.
- New task starts at 0%.
- New task status is Not Started.
- Task appears immediately after save.

Priority: Must Have  
Estimate: 3 points

---

### US-015 — Edit or delete task

**As a user,**  
I want to update or delete a task  
so that my work breakdown remains accurate.

#### Acceptance Criteria

- User can edit title, description and priority.
- Delete requires confirmation.
- Deleting a task removes its sessions.
- Milestone and deadline progress recalculate.

Priority: Must Have  
Estimate: 2 points

---

### US-016 — View task detail

**As a user,**  
I want to view one task’s progress and sessions  
so that I know what remains.

#### Acceptance Criteria

- Screen shows parent deadline and milestone.
- Current progress is prominent.
- Next planned session is visible.
- Recent session progress changes are visible.
- Primary action is Plan Next Session.

Priority: Must Have  
Estimate: 3 points

---

## Epic 5 — Session Planning

### US-017 — Plan session

**As a user,**  
I want to schedule a focus session  
so that I know when I will work on a task.

#### Acceptance Criteria

- User selects task, date, time and duration.
- User selects Normal or High Focus.
- Duration must be greater than zero.
- Session is created with Planned status.
- Session appears on Today when scheduled for today.
- A reminder notification is scheduled.

Priority: Must Have  
Estimate: 5 points

---

### US-018 — Edit or reschedule session

**As a user,**  
I want to reschedule a session  
so that I can adjust my plan.

#### Acceptance Criteria

- Existing session data is prefilled.
- User can change date, time, duration and focus mode.
- Old notification is cancelled.
- New notification is scheduled.
- Updated session appears in the correct Today section.

Priority: Must Have  
Estimate: 3 points

---

### US-019 — Cancel or skip session

**As a user,**  
I want to cancel or skip a session  
so that the plan reflects reality.

#### Acceptance Criteria

- Cancel and Skip are available before start.
- Confirmation is shown.
- Associated notification is cancelled.
- Status changes correctly.
- Cancelled or skipped sessions cannot be started.

Priority: Should Have  
Estimate: 2 points

---

### US-020 — View Today schedule

**As a user,**  
I want to see today’s sessions  
so that I know what to do now.

#### Acceptance Criteria

- Today shows one current or next session prominently.
- Later sessions are shown below.
- Completed sessions are limited to two items.
- A View All action opens history.
- One important risk alert may be shown.
- Empty state is shown when no session exists.

Priority: Must Have  
Estimate: 5 points

---

## Epic 6 — Focus Session Execution

### US-021 — Start focus session

**As a user,**  
I want to start a scheduled session  
so that I can focus on my task.

#### Acceptance Criteria

- Only a valid Planned session can start.
- Session status changes to In Progress.
- startedAt and expectedEndAt are saved.
- Active session snapshot is stored locally.
- Timer displays remaining time.
- Finish notification is scheduled.
- Focus screen hides bottom navigation.

Priority: Must Have  
Estimate: 5 points

---

### US-022 — Pause and resume session

**As a user,**  
I want to pause and resume  
so that interruptions do not invalidate the session.

#### Acceptance Criteria

- User can pause an active session.
- Timer stops visually while paused.
- Status changes to Paused.
- Resume restores In Progress.
- Remaining time remains correct.
- Notification timing is updated.

Priority: Must Have  
Estimate: 5 points

---

### US-023 — Recover active session

**As a user,**  
I want my running timer to recover after reopening the app  
so that I do not lose my session.

#### Acceptance Criteria

- App reads active session snapshot on startup.
- Remote and local status are reconciled.
- Remaining time is calculated from timestamps.
- If time has finished, app opens finished state.
- User is directed to Post-Session Review when appropriate.

Priority: Must Have  
Estimate: 5 points

---

### US-024 — End session early

**As a user,**  
I want to end a session early  
so that completed work is still recorded.

#### Acceptance Criteria

- End Early opens confirmation.
- Cancelling returns to Focus.
- Confirming records endedAt and actual duration.
- Status becomes Ended Early.
- Finish notification is cancelled.
- User proceeds to Post-Session Review.

Priority: Must Have  
Estimate: 3 points

---

### US-025 — Complete timer

**As a user,**  
I want the app to notify me when time ends  
so that I know the session is finished.

#### Acceptance Criteria

- Timer reaches zero accurately.
- Session status becomes Completed.
- Local notification appears when app is backgrounded.
- Opening the app leads to review.
- Timer cannot continue below zero.

Priority: Must Have  
Estimate: 3 points

---

### US-026 — Use High Focus

**As a user,**  
I want fewer interruptions during deep work  
so that I can concentrate.

#### Acceptance Criteria

- High Focus checks DND permission.
- Permission explanation appears when missing.
- Session can still continue without permission.
- Previous device notification state is remembered where supported.
- State is restored after Session ends.
- UI never claims all notifications are absolutely blocked.

Priority: Should Have  
Estimate: 5 points

---

## Epic 7 — Post-Session Review

### US-027 — Review session progress

**As a user,**  
I want to update task progress after a session  
so that OnTrack reflects what I actually completed.

#### Acceptance Criteria

- Screen shows progressBefore.
- Allowed progress values begin at progressBefore.
- 100% is always available.
- progressAfter cannot be lower than progressBefore.
- User can enter a short result note.
- Actual duration is displayed.
- Save uses one server transaction.

Priority: Must Have  
Estimate: 5 points

---

### US-028 — Create follow-up session

**As a user,**  
I want to plan another session when a task is unfinished  
so that I can continue later.

#### Acceptance Criteria

- Follow-up prompt appears only after review is saved.
- Prompt appears only when progress is below 100%.
- Follow-up session uses the same Task.
- progressBefore equals current Task progress.
- Previous focus mode may be suggested.
- User chooses new date, time and duration.

Priority: Must Have  
Estimate: 3 points

---

### US-029 — Complete task at 100%

**As a user,**  
I want a task to complete automatically at 100%  
so that I do not perform duplicate updates.

#### Acceptance Criteria

- Saving 100% changes Task status to Completed.
- completedAt is recorded.
- Follow-up prompt is not shown.
- Milestone progress recalculates.
- Deadline progress recalculates.
- Success state is shown.

Priority: Must Have  
Estimate: 3 points

---

## Epic 8 — Progress & Risk

### US-030 — Calculate progress automatically

**As a user,**  
I want progress to update automatically  
so that I do not need to maintain multiple levels manually.

#### Acceptance Criteria

- Task progress comes from saved session review.
- Milestone progress is average Task progress.
- Deadline progress is average Milestone progress.
- Empty containers show 0%.
- Progress values remain between 0 and 100.
- UI does not allow direct deadline or milestone progress editing.

Priority: Must Have  
Estimate: 5 points

---

### US-031 — Detect at-risk deadline

**As a user,**  
I want OnTrack to warn me when I am falling behind  
so that I can adjust early.

#### Acceptance Criteria

- Risk calculation compares expected and actual progress.
- Deadline becomes At Risk when gap exceeds MVP threshold.
- Deadline becomes Overdue after due date if below 100%.
- Completed deadline is never At Risk.
- Risk state updates after review or relevant plan changes.

Priority: Must Have  
Estimate: 5 points

---

### US-032 — Show actionable risk message

**As a user,**  
I want a simple recommendation  
so that I know what action to take.

#### Acceptance Criteria

- Today shows no more than one risk alert.
- Message uses plain language.
- Alert links to relevant Deadline or Task.
- Technical metrics are hidden by default.
- Example message:
  “You are behind by about 2 sessions.”

Priority: Must Have  
Estimate: 3 points

---

### US-033 — View session history

**As a user,**  
I want to see previous sessions  
so that I can review my effort.

#### Acceptance Criteria

- History shows completed, ended-early and skipped sessions.
- Active sessions do not appear.
- Card shows task, date, duration, focus mode and progress transition.
- User can filter by date and focus mode.

Priority: Should Have  
Estimate: 3 points

---

## Epic 9 — Notifications & Settings

### US-034 — Session reminder notification

**As a user,**  
I want a reminder before a session  
so that I do not forget to start.

#### Acceptance Criteria

- Notification is scheduled when Session is created.
- Reminder time follows user settings.
- Notification opens the correct Session.
- Reschedule updates notification.
- Cancel deletes notification.

Priority: Must Have  
Estimate: 5 points

---

### US-035 — Manage notification settings

**As a user,**  
I want to control notifications  
so that OnTrack does not become distracting.

#### Acceptance Criteria

- User can enable or disable reminders.
- User can select reminder lead time.
- User can enable or disable daily summary.
- User can enable or disable risk alerts.
- Settings persist between app launches.

Priority: Should Have  
Estimate: 3 points

---

### US-036 — View profile and summary

**As a user,**  
I want to view my account and weekly summary  
so that I can understand my activity.

#### Acceptance Criteria

- Me shows user information.
- Weekly focus duration is shown.
- Completed sessions count is shown.
- Deadlines completed on time is shown.
- Only one simple visualization is used.

Priority: Should Have  
Estimate: 3 points

---

## Epic 10 — Testing & Release

### US-037 — Add unit tests

#### Acceptance Criteria

Tests cover:

- Progress validation.
- Task status calculation.
- Milestone progress.
- Deadline progress.
- Risk calculation.
- Timer calculation.
- Follow-up validation.

Priority: Must Have  
Estimate: 5 points

---

### US-038 — Add integration test for core flow

#### Acceptance Criteria

Automated or documented integration test covers:

```text
Login
→ Create Deadline
→ Add Milestone
→ Add Task
→ Plan Session
→ Start Session
→ Save Review
→ Verify Progress
```

Priority: Must Have  
Estimate: 5 points

---

### US-039 — Perform Android lifecycle testing

#### Acceptance Criteria

Manually verify:

- App goes to background during timer.
- Device is locked.
- App is killed and reopened.
- Notification is tapped.
- Internet disconnects during review.
- DND permission is denied.
- Session is ended early.

Priority: Must Have  
Estimate: 3 points

---

### US-040 — Prepare demo data and release build

#### Acceptance Criteria

- Demo account or seed data exists.
- Release APK builds successfully.
- No secrets are committed.
- Critical flows are tested.
- Demo script is prepared.
- Known limitations are documented.

Priority: Must Have  
Estimate: 3 points

---

# 4. MVP Priority Summary

## Must Have

```text
Foundation
Authentication
Deadline CRUD
Milestone CRUD
Task CRUD
Session planning
Today
Timer
Pause/resume
Session recovery
Post-session review
Progress calculation
Risk detection
Local notifications
Core testing
```

## Should Have

```text
High Focus DND integration
Session history filters
Weekly summary
Advanced notification settings
Skip session
```

## Could Have

```text
Dark mode
Drag-and-drop ordering
Advanced charts
Calendar view
Custom colors
More risk explanation
```

## Won’t Have in MVP

```text
AI task generation
Social features
Team collaboration
Leaderboard
Marketplace
Complex gamification
Full offline sync
Google Calendar two-way sync
```

---

# 5. Sprint Plan

Assumption:

```text
6 sprints
1 sprint = 1 week
Solo developer or small student team
```

---

## Sprint 1 — Foundation & Authentication

### Goal

Create the app shell and authenticated navigation.

### Scope

- US-001 Initialize project.
- US-002 Global theme.
- US-003 Navigation.
- US-004 Register.
- US-005 Login.
- US-006 Logout.

### Deliverable

```text
User can register, log in and navigate between Today, Plans and Me.
```

---

## Sprint 2 — Deadline, Milestone & Task

### Goal

Allow users to create the full planning hierarchy.

### Scope

- US-007 Deadline list.
- US-008 Create deadline.
- US-009 Edit deadline.
- US-010 Delete deadline.
- US-011 Add milestone.
- US-012 Edit/delete milestone.
- US-013 View tasks in milestones.
- US-014 Create task.
- US-015 Edit/delete task.
- US-016 Task detail.

### Deliverable

```text
User can build:
Deadline → Milestone → Task
```

---

## Sprint 3 — Session Planning & Today

### Goal

Turn tasks into scheduled work.

### Scope

- US-017 Plan session.
- US-018 Edit/reschedule.
- US-019 Cancel/skip.
- US-020 Today schedule.
- US-034 Session reminder notification.

### Deliverable

```text
User can schedule sessions and see today’s plan.
```

---

## Sprint 4 — Focus Session Engine

### Goal

Build the reliable execution experience.

### Scope

- US-021 Start focus.
- US-022 Pause/resume.
- US-023 Recover active session.
- US-024 End early.
- US-025 Timer completion.
- US-026 High Focus where feasible.

### Deliverable

```text
A session timer works across foreground, background and app restart.
```

---

## Sprint 5 — Review, Progress & Risk

### Goal

Complete the core product feedback loop.

### Scope

- US-027 Review progress.
- US-028 Follow-up session.
- US-029 Complete task.
- US-030 Automatic progress.
- US-031 Risk detection.
- US-032 Actionable warning.
- US-033 Session history.

### Deliverable

```text
Session Review
→ Task Progress
→ Milestone Progress
→ Deadline Progress
→ Risk Update
```

---

## Sprint 6 — Settings, Testing & Release

### Goal

Stabilize and prepare the project for presentation.

### Scope

- US-035 Notification settings.
- US-036 Profile summary.
- US-037 Unit tests.
- US-038 Integration test.
- US-039 Lifecycle testing.
- US-040 Demo and release.

### Deliverable

```text
Stable demo APK with tested core flow and documented limitations.
```

---

# 6. Recommended Build Order Inside Each Feature

For each feature:

```text
1. Database schema or RPC
2. Domain entity
3. Repository interface
4. Data source
5. Riverpod controller
6. Screen and widget
7. Error and empty states
8. Tests
```

Do not build all UI first and connect data later.

---

# 7. Definition of Done

A story is complete only when:

- Acceptance criteria are met.
- Loading state exists.
- Empty state exists where relevant.
- Error state is handled.
- Validation is implemented.
- Data access respects RLS.
- Main path is manually tested.
- No critical console errors remain.
- UI follows approved wireframe.
- Code is committed with a meaningful message.

---

# 8. Core Demo Scenario

Use this for the final presentation:

```text
1. User logs in.
2. Creates “Mobile Final Project”.
3. Adds Milestone “UI Design”.
4. Adds Task “Design Dashboard”.
5. Plans a 45-minute High Focus Session.
6. Starts the Session.
7. Ends the Session.
8. Updates Task progress from 0% to 40%.
9. Creates a follow-up Session.
10. Shows updated Milestone and Deadline progress.
11. Shows an At Risk or On Track message.
```

This demonstrates the full OnTrack value loop without requiring every secondary feature.
