# Complete FE Team Integration Implementation Plan

> **For agentic workers:** Execute inline with a test-first cycle for each task; do not retain mock handlers once the equivalent endpoint or local preference exists.

**Goal:** Replace remaining FE-team mock behaviour with working REST-backed or persistently local functionality, while retaining the integrated UI routes.

**Architecture:** The existing feature API modules remain the only REST boundary. Screens use route parameters and feature APIs rather than embedded fixtures; preferences that have no backend model are stored in AsyncStorage under explicit OnTrack keys. Legacy design routes become thin working entry points to the same domain behaviour rather than independent fake workflows.

**Tech Stack:** Expo Router, React Native, TypeScript, AsyncStorage, FastAPI, PostgreSQL, Vitest, Expo web.

## Global Constraints

- Keep `origin/master` UI as the presentation baseline.
- Never put backend secrets in Expo variables.
- Use `/api/v3` for all supported domain writes and reads.
- Only use AsyncStorage for notification/focus preferences because the current backend exposes no preference schema for them.
- Every corrected regression receives a focused failing test before production code.

---

### Task 1: Remove mock profile and history data

**Files:** `app/(tabs)/me.tsx`, `app/history/history.tsx`, `src/features/dashboard/api.ts`, focused domain tests.

- [ ] Add failing tests for mapping API history rows and persisted profile presentation.
- [ ] Fetch user/profile and session history from their existing REST endpoints.
- [ ] Render empty/loading/error states rather than hard-coded Alex Rivers, weekly counts, or empty props.
- [ ] Verify browser E2E profile/history against a test account.

### Task 2: Make account and settings persist

**Files:** `app/settings/account.tsx`, `app/settings/focus-settings.tsx`, `app/settings/notification-settings.tsx`, `src/features/settings/*`, focused tests.

- [ ] Add failing tests for serializing account/profile values and local preference round-trips.
- [ ] Save name/timezone through `PUT /api/v3/users/me` and refresh the auth store.
- [ ] Persist focus/notification choices through named AsyncStorage keys and load them on re-entry.
- [ ] Verify reload persistence in browser E2E.

### Task 3: Replace legacy planning screen handlers

**Files:** legacy deadline/milestone/task create/edit/detail screens plus dynamic domain routes where needed.

- [ ] Add failing mapper tests for route parameter → REST inputs.
- [ ] Route direct legacy paths to the API-backed detail/create screens or replace their console-only submit handlers with API calls.
- [ ] Make edit/delete return to the parent resource after successful mutation and show errors on failure.
- [ ] Verify create, edit, delete for Deadline, Milestone, and Task via browser.

### Task 4: Replace legacy session screens and complete route surface

**Files:** `app/session/{plan-session,detail-session,focus,post-review}.tsx`, `app/session/*`, history.

- [ ] Add failing tests for session route IDs and review payload conversion.
- [ ] Use existing session APIs for planning, lifecycle, review, and history; redirect legacy routes to the working parameterized routes.
- [ ] Verify start/pause/resume/end/review/follow-up and History UI via browser.

### Task 5: Completion audit

**Files:** `docs/ontrack-final-report.html`, tests.

- [ ] Search for remaining fake domain payload logs and hard-coded identity/data in reachable screens.
- [ ] Run all Vitest tests, typecheck, Expo web export, REST coverage, and UI E2E flows.
- [ ] Update the report with implemented scope and explicitly documented local-only preferences.
