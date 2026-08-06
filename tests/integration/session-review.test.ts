import { describe, expect, it } from 'vitest';

describe('session review contract', () => {
  it('keeps review and follow-up RPC names stable for the FE contract', async () => {
    const dashboard = await import('../../src/features/dashboard/api');
    expect(dashboard.completeSessionReview).toBeTypeOf('function');
    expect(dashboard.createFollowUpSession).toBeTypeOf('function');
    expect(dashboard.getTodayDashboard).toBeTypeOf('function');
    expect(dashboard.getDeadlineRisk).toBeTypeOf('function');
  });
});
