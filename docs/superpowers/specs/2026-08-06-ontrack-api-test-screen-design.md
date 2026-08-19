# OnTrack API Test Screen Design

## Goal

Add a dev-only `/api-test` route that exercises the implemented Supabase API contract through a compact UI following the approved OnTrack flow, without changing existing tabs or production navigation.

## Scope

The screen covers Auth, Plans hierarchy, session lifecycle, review, and follow-up creation. It uses the existing feature API modules and query hooks. It does not add business rules, notifications, persistence, or production navigation changes.

## UX and data flow

The screen renders stacked cards in this order:

1. Auth: email, password, full name, Register and Login.
2. Plan: create a Deadline, then a Milestone and Task using returned IDs.
3. Session: create a planned session for the created task.
4. Focus: Start, Pause, Resume, and End the current session.
5. Review: enter progress-after, actual minutes, and note; save the review.
6. Follow-up: create a follow-up only when the review result allows it.

Each successful mutation stores its returned resource ID in local screen state and unlocks the next card. Every action shows a disabled/loading state and a concise error banner. Missing Supabase configuration is reported as a recoverable setup error.

## Implementation

- Create `app/api-test.tsx` as a standalone Expo Router route.
- Use React Native primitives and existing `src/theme/colors.ts` for styling.
- Call `register`, `login`, planning APIs, session APIs, and dashboard/review APIs directly from their feature modules.
- Keep timer display derived from `expected_end_at`; no decrement-only timer state is used.
- Do not modify `app/(tabs)/*`, tab layouts, stores, or the main auth routing.

## Verification

- Add a focused test for the route's flow-state helper if test infrastructure permits.
- Run the focused test and `pnpm run typecheck`.
- Confirm the route is reachable at `/api-test` and existing route files are unchanged.
