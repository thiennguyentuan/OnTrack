import { describe, expect, it } from 'vitest';
import {
  buildNotificationPlan,
  nextMondayAt,
  nextOccurrenceOfHour,
  routeForNotification,
} from '../../src/features/notifications/scheduling';
import { notificationDefaults } from '../../src/features/settings/preferences';

const now = new Date('2026-08-19T09:00:00');
const prefs = (over: Partial<typeof notificationDefaults> = {}) => ({ ...notificationDefaults, ...over });

const sessions = [
  { id: 's1', task_title: 'UI Design', planned_start_at: '2026-08-19T14:00:00', estimated_minutes: 45, focus_mode: 'HIGH', status: 'PLANNED' },
  { id: 's2', task_title: 'Already done', planned_start_at: '2026-08-19T08:00:00', estimated_minutes: 30, focus_mode: 'NORMAL', status: 'COMPLETED' },
  { id: 's3', task_title: 'Too late to warn', planned_start_at: '2026-08-19T09:05:00', estimated_minutes: 30, focus_mode: 'NORMAL', status: 'PLANNED' },
];

const deadlines = [
  { id: 'd1', title: 'Final Year Project', due_at: '2026-09-08T23:59:59', progress: 45, risk_level: 'AT_RISK' },
  { id: 'd2', title: 'Finished Report', due_at: '2026-08-25T23:59:59', progress: 100, risk_level: 'ON_TRACK' },
  { id: 'd3', title: 'Mobile App', due_at: '2026-10-01T23:59:59', progress: 60, risk_level: 'ON_TRACK' },
];

const keys = (plan: { key: string }[]) => plan.map((item) => item.key);

describe('notification scheduling', () => {
  it('schedules a reminder ahead of each planned session only', () => {
    const plan = buildNotificationPlan({ sessions, deadlines: [], preferences: prefs({ dailyDigest: false, riskAlerts: false, upcomingDeadline: false }), now });
    expect(keys(plan)).toEqual(['session-s1']);
    // 15 minutes before 14:00
    expect(plan[0].fireAt).toEqual(new Date('2026-08-19T13:45:00'));
    expect(plan[0].route).toBe('/session/s1');
    expect(plan[0].body).toContain('UI Design');
  });

  it('drops reminders whose lead time has already passed', () => {
    const plan = buildNotificationPlan({ sessions, deadlines: [], preferences: prefs({ sessionReminderMinutes: 60, dailyDigest: false, riskAlerts: false, upcomingDeadline: false }), now });
    // s1 at 13:00 is still ahead; s3 would fire at 08:05, already gone
    expect(keys(plan)).toEqual(['session-s1']);
  });

  it('alerts before a deadline but skips finished ones', () => {
    const plan = buildNotificationPlan({ sessions: [], deadlines, preferences: prefs({ sessionReminders: false, dailyDigest: false, riskAlerts: false }), now });
    expect(keys(plan)).toEqual(['deadline-d1', 'deadline-d3']);
    expect(plan[0].fireAt).toEqual(new Date('2026-09-05T23:59:59'));
    expect(plan[0].body).toContain('3 days');
  });

  it('raises a risk alert for deadlines that fell behind', () => {
    const plan = buildNotificationPlan({ sessions: [], deadlines, preferences: prefs({ sessionReminders: false, upcomingDeadline: false, dailyDigest: false }), now });
    expect(keys(plan)).toEqual(['risk-d1']);
    expect(plan[0].route).toBe('/risk/d1');
  });

  it('adds the daily digest and weekly report at the configured hour', () => {
    const plan = buildNotificationPlan({ sessions: [], deadlines: [], preferences: prefs({ sessionReminders: false, upcomingDeadline: false, riskAlerts: false, weeklyReport: true }), now });
    expect(keys(plan)).toEqual(['daily-digest', 'weekly-report']);
    expect(plan[0].fireAt).toEqual(new Date('2026-08-19T20:00:00'));
    expect(plan[1].fireAt.getDay()).toBe(1);
  });

  it('schedules nothing at all when notifications are switched off', () => {
    expect(buildNotificationPlan({ sessions, deadlines, preferences: prefs({ allowAll: false }), now })).toEqual([]);
  });

  it('returns the plan in firing order', () => {
    const plan = buildNotificationPlan({ sessions, deadlines, preferences: prefs({ weeklyReport: true }), now });
    const times = plan.map((item) => item.fireAt.getTime());
    expect([...times].sort((a, b) => a - b)).toEqual(times);
  });

  it('gives every event a stable key so re-planning replaces instead of duplicating', () => {
    const first = buildNotificationPlan({ sessions, deadlines, preferences: prefs(), now });
    const second = buildNotificationPlan({ sessions, deadlines, preferences: prefs(), now });
    expect(keys(first)).toEqual(keys(second));
    expect(new Set(keys(first)).size).toBe(first.length);
  });

  it('rolls the digest hour to tomorrow once it has passed', () => {
    expect(nextOccurrenceOfHour(20, new Date('2026-08-19T09:00:00'))).toEqual(new Date('2026-08-19T20:00:00'));
    expect(nextOccurrenceOfHour(8, new Date('2026-08-19T09:00:00'))).toEqual(new Date('2026-08-20T08:00:00'));
  });

  it('always lands the weekly report on a future Monday', () => {
    const monday = nextMondayAt(20, new Date('2026-08-19T09:00:00'));
    expect(monday.getDay()).toBe(1);
    expect(monday.getTime()).toBeGreaterThan(new Date('2026-08-19T09:00:00').getTime());
  });

  it('routes a tapped notification, falling back to Today for junk payloads', () => {
    expect(routeForNotification({ route: '/session/abc' })).toBe('/session/abc');
    expect(routeForNotification({ route: 'not-a-route' })).toBe('/(tabs)/today');
    expect(routeForNotification(null)).toBe('/(tabs)/today');
    expect(routeForNotification(undefined)).toBe('/(tabs)/today');
  });
});
