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

  it('rounds the averaged progress the API returns', () => {
    // deadlines.progress is an average of milestone progress, so it arrives as 45.83
    expect(toPlanItem({
      id: 'deadline-2', title: 'Final Year Project', due_at: '2026-09-08T00:00:00.000Z',
      progress: 45.833333, risk_level: 'AT_RISK', status: 'AT_RISK', priority: 'HIGH',
    }, new Date('2026-08-19T00:00:00.000Z')).progress).toBe(46);
  });

  it('labels a single remaining day in the singular', () => {
    const item = toPlanItem({
      id: 'deadline-3', title: 'Tomorrow', due_at: '2026-08-20T00:00:00.000Z',
      progress: 10, risk_level: 'ON_TRACK', status: 'IN_PROGRESS', priority: 'LOW',
    }, new Date('2026-08-19T00:00:00.000Z'));
    expect(`${item.daysLeft} ${item.daysLeftLabel}`).toBe('1 day left');
  });
});
