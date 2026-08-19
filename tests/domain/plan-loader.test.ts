import { describe, expect, it } from 'vitest';
import { loadPlanItems } from '../../src/features/plans/load-plan-items';

describe('loadPlanItems', () => {
  it('loads the newly created deadline whenever the Plans screen refreshes', async () => {
    let calls = 0;
    const fetchDeadlines = async () => {
      calls += 1;
      return [{
        id: 'new-deadline', title: 'Created from form', due_at: '2026-09-01T23:59:59.000Z',
        priority: 'HIGH', status: 'PLANNING', progress: 0, risk_level: 'ON_TRACK',
      }];
    };

    const first = await loadPlanItems(fetchDeadlines);
    const second = await loadPlanItems(fetchDeadlines);

    expect(calls).toBe(2);
    expect(first[0].title).toBe('Created from form');
    expect(second[0].id).toBe('new-deadline');
  });
});
