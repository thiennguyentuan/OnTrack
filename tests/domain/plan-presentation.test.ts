import { describe, expect, it } from 'vitest';
import { toPlanItem } from '../../src/features/plans/presentation';

describe('toPlanItem', () => {
  it('maps an at-risk API deadline to the Plans card presentation', () => {
    expect(toPlanItem({
      id: 'deadline-1', title: 'Mobile final', due_at: '2026-08-20T00:00:00.000Z',
      progress: 65, risk_level: 'AT_RISK', status: 'AT_RISK', priority: 'HIGH',
    }, new Date('2026-08-18T00:00:00.000Z'))).toMatchObject({
      id: 'deadline-1', category: 'AT_RISK', statusLabel: 'AT RISK', progress: 65, daysLeft: 2,
    });
  });
});
