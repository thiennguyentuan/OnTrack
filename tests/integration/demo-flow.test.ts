import { describe, expect, it } from 'vitest';

describe('demo flow contract', () => {
  it('exposes every API operation needed by the seeded demo path', async () => {
    const auth = await import('../../src/features/auth/api');
    const plans = await import('../../src/features/plans/api');
    const sessions = await import('../../src/features/sessions/api');
    const dashboard = await import('../../src/features/dashboard/api');
    for (const fn of [auth.register, auth.login, plans.createDeadline, plans.createMilestone, plans.createTask, sessions.createSession, sessions.startSession, sessions.endSession, dashboard.completeSessionReview, dashboard.createFollowUpSession]) expect(fn).toBeTypeOf('function');
  });
});
