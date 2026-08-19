# API Test Screen Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add a standalone `/api-test` Expo route that exercises the OnTrack Supabase API contract in the approved UX order without changing production screens.

**Architecture:** A single dev-only route owns only transient UI state and delegates all persistence to existing feature API modules. Cards unlock sequentially from returned IDs; session timing is rendered from the backend `expected_end_at` timestamp.

**Tech Stack:** Expo Router, React Native, TypeScript, existing Supabase feature APIs, Vitest.

## Global Constraints

- Do not modify existing tab screens, tab layout, auth routing, or active-session store.
- Do not recreate backend business rules in the UI.
- Use existing API modules for auth, plans, sessions, dashboard, review, and follow-up operations.
- Show recoverable setup/API errors in the route instead of crashing the app.

---

### Task 1: Add the dev-only route shell and flow state

**Files:**
- Create: `app/api-test.tsx`
- Create: `src/features/api-test/flow.ts`
- Test: `tests/domain/api-test-flow.test.ts`

**Interfaces:**
- `getNextApiTestStep(state)` returns the first incomplete step from `auth`, `plan`, `session`, `focus`, `review`, `followUp`.
- The route stores `userId`, `deadlineId`, `milestoneId`, `taskId`, `sessionId`, and `reviewResult` locally.

- [ ] **Step 1: Write the failing flow-state test.**

```ts
import { describe, expect, it } from 'vitest';
import { getNextApiTestStep } from '../../src/features/api-test/flow';

describe('getNextApiTestStep', () => {
  it('starts at auth and advances through the UX flow', () => {
    expect(getNextApiTestStep({})).toBe('auth');
    expect(getNextApiTestStep({ userId: 'u' })).toBe('plan');
    expect(getNextApiTestStep({ userId: 'u', taskId: 't' })).toBe('session');
    expect(getNextApiTestStep({ userId: 'u', taskId: 't', sessionId: 's' })).toBe('focus');
    expect(getNextApiTestStep({ userId: 'u', taskId: 't', sessionId: 's', focusEnded: true })).toBe('review');
  });
});
```

- [ ] **Step 2: Run the focused test and confirm RED.**

Run: `pnpm exec vitest run tests/domain/api-test-flow.test.ts`

Expected: FAIL because the flow helper does not exist.

- [ ] **Step 3: Implement the helper and route shell.**

Implement the helper with the ordered state checks above. The route renders a `ScrollView`, a setup/error banner, and six labeled cards. Use `colors` from `src/theme/colors.ts` and keep all state local to the route.

- [ ] **Step 4: Run the focused test and typecheck.**

Run: `pnpm exec vitest run tests/domain/api-test-flow.test.ts; pnpm run typecheck`

Expected: the focused test passes and typecheck exits 0.

- [ ] **Step 5: Commit.**

```bash
git add app/api-test.tsx src/features/api-test/flow.ts tests/domain/api-test-flow.test.ts
git commit -m "feat: add API test flow screen"
```

### Task 2: Wire the API actions and timer presentation

**Files:**
- Modify: `app/api-test.tsx`
- Modify: `src/features/api-test/flow.ts`

**Interfaces:**
- Auth actions call `register` and `login`.
- Planning actions call `createDeadline`, `createMilestone`, `createTask`.
- Session actions call `createSession`, `startSession`, `pauseSession`, `resumeSession`, `endSession`.
- Review actions call `completeSessionReview` and `createFollowUpSession`.

- [ ] **Step 1: Add API action handlers to the route.**

Each handler sets a single loading action, catches `ApiError` or `Error` into the banner, and stores returned IDs. Use fixed demo-friendly defaults for optional fields while leaving editable inputs for email/password/title/duration/progress.

- [ ] **Step 2: Add timestamp-derived focus display.**

Render `expected_end_at` and compute remaining minutes from `Date.parse(expected_end_at) - Date.now()`. Do not decrement a client counter. Refresh the display with a one-second interval only while the current session is `IN_PROGRESS`.

- [ ] **Step 3: Add review and follow-up states.**

After End, enable Review. On review success, show returned progress/status and render Follow-up only when `can_create_follow_up` is true.

- [ ] **Step 4: Run all available checks.**

Run: `pnpm exec vitest run tests/domain/api-test-flow.test.ts; pnpm run typecheck`

Expected: focused test passes and typecheck exits 0. If Supabase is unavailable, the route remains unverified at runtime but compiles with the configured public environment contract.

- [ ] **Step 5: Commit.**

```bash
git add app/api-test.tsx src/features/api-test/flow.ts
git commit -m "feat: wire API test flow actions"
```
