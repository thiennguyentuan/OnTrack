# OnTrack FE Master REST Integration Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Merge the FE screens from `origin/master` into the existing REST demo backend and make the user flow executable end-to-end.

**Architecture:** Preserve the FastAPI/PostgreSQL API at `/api/v3`; adapt the Expo app through `src/lib/api-client.ts` and feature API modules. UI remains owned by the FE branch, while all displayed and submitted data comes from the REST service rather than embedded fixtures.

**Tech Stack:** Expo Router, React Native, TypeScript, Vitest, FastAPI, PostgreSQL, Docker Compose.

## Global Constraints

- Preserve uncommitted local backend work before applying `origin/master`.
- Never place a backend secret in an `EXPO_PUBLIC_*` variable.
- All protected API calls use the bearer token stored by `api-client.ts`.
- The validated flow is register/login → deadline → milestone → task → session → start/end → review.

---

### Task 1: Merge FE safely

**Files:** all FE files modified by `origin/master`; preserve backend and REST files.

- [ ] Create a recoverable git stash of current tracked and untracked work.
- [ ] Merge `origin/master` with `--no-commit`.
- [ ] Restore the stash, resolve only integration conflicts by retaining REST implementation, then inspect the staged diff.
- [ ] Run `pnpm install --frozen-lockfile` or lockfile-compatible installation.

### Task 2: Restore typed REST integration boundary

**Files:** `src/lib/api-client.ts`, `src/lib/api-error.ts`, `src/features/{auth,plans,sessions,dashboard}/api.ts`, `src/stores/authStore.ts`.

- [ ] Write a failing Vitest test for API error normalization and token-backed request behavior.
- [ ] Run the target test and confirm the failure is attributable to the missing/broken boundary.
- [ ] Implement minimal REST request, auth/session persistence, and resource methods mapping UI actions to `/api/v3`.
- [ ] Run the target test and TypeScript typecheck.

### Task 3: Connect FE screens

**Files:** relevant imported FE screens under `app/`, using the feature API modules above.

- [ ] Replace hard-coded deadline/session data at visible navigation points with loading, error, empty, and API-backed states.
- [ ] Map screen parameters to API resource IDs and route actions to the existing REST endpoints.
- [ ] Add or update domain tests for mapping helpers where practical.
- [ ] Run TypeScript typecheck and the complete Vitest suite.

### Task 4: Runtime verification and final report

**Files:** `backend/`, `docker-compose.yml`, `docs/ontrack-final-report.html`.

- [ ] Start PostgreSQL/FastAPI dependencies through Docker Compose and verify `/health`.
- [ ] Exercise the authenticated API flow with a disposable test account; record exact outcomes.
- [ ] Build/check Expo web bundle when the local toolchain supports it.
- [ ] Generate an HTML report listing merged commit range, integration coverage, commands/results, known limitations, and run instructions.
