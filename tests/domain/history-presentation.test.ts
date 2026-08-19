import { describe, expect, it } from 'vitest';
import {
  formatFocusDuration,
  summarizeSessionHistory,
  toHistoryTasks,
  weeklyFocusSeries,
} from '../../src/features/dashboard/history-presentation';

const sessions = [
  { id: 's1', task_id: 't1', task_title: 'REST-backed task', estimated_minutes: 45, actual_minutes: 30, focus_mode: 'HIGH', status: 'COMPLETED' },
  { id: 's2', task_id: 't2', task_title: 'Second task', estimated_minutes: 20, actual_minutes: null, focus_mode: 'NORMAL', status: 'ENDED_EARLY' },
];

describe('history presentation', () => {
  it('uses the API task title and real completed duration for the profile summary', () => {
    expect(summarizeSessionHistory(sessions)).toEqual({ completedSessions: 2, focusMinutes: 50 });
    expect(toHistoryTasks(sessions)).toEqual([
      { id: 't1', title: 'REST-backed task', current_progress: 0 },
      { id: 't2', title: 'Second task', current_progress: 0 },
    ]);
  });

  it('buckets focus minutes into the real day they were finished', () => {
    const now = new Date('2026-08-19T20:00:00');
    const series = weeklyFocusSeries(
      [
        { id: 's1', task_id: 't1', estimated_minutes: 45, actual_minutes: 60, ended_at: '2026-08-19T10:00:00' },
        { id: 's2', task_id: 't2', estimated_minutes: 30, actual_minutes: 30, ended_at: '2026-08-19T14:00:00' },
        { id: 's3', task_id: 't3', estimated_minutes: 45, actual_minutes: 45, ended_at: '2026-08-17T09:00:00' },
        { id: 's4', task_id: 't4', estimated_minutes: 45, actual_minutes: 45, ended_at: '2026-01-01T09:00:00' },
      ],
      now,
    );
    expect(series).toHaveLength(7);
    expect(series[6]).toMatchObject({ minutes: 90, isToday: true, height: 100 });
    expect(series[4]).toMatchObject({ minutes: 45, height: 50 });
    expect(series[5].minutes).toBe(0);
    // the January session falls outside the window and must not be counted
    expect(series.reduce((total, day) => total + day.minutes, 0)).toBe(135);
  });

  it('reports zero-height bars when there is no focus time yet', () => {
    expect(weeklyFocusSeries([], new Date('2026-08-19T20:00:00')).every((day) => day.height === 0)).toBe(true);
  });

  it('formats focus totals the way the wireframe does', () => {
    expect(formatFocusDuration(750)).toBe('12h 30m');
    expect(formatFocusDuration(120)).toBe('2h');
    expect(formatFocusDuration(45)).toBe('45m');
    expect(formatFocusDuration(0)).toBe('0m');
  });
});
