import { describe, expect, it } from 'vitest';
import {
  filterTodaySessions,
  groupTodaySessions,
  TODAY_FILTERS,
  todayFilterCounts,
  type TodaySession,
} from '../../src/features/dashboard/today-presentation';

const session = (id: string, status: string, time: string): TodaySession => ({
  id, status, planned_start_at: `2026-08-19T${time}:00`, estimated_minutes: 45, task_title: id,
});

const sessions = [
  session('later', 'PLANNED', '16:00'),
  session('running', 'IN_PROGRESS', '10:00'),
  session('next', 'PLANNED', '14:00'),
  session('finished', 'COMPLETED', '08:00'),
  session('dropped', 'CANCELLED', '09:00'),
];

describe('today presentation', () => {
  it('offers exactly the four filters from the wireframe', () => {
    expect(TODAY_FILTERS.map((filter) => filter.label)).toEqual(['All', 'In Progress', 'Upcoming', 'Done']);
  });

  it('hides cancelled sessions from every filter, including All', () => {
    expect(filterTodaySessions(sessions, 'ALL').map((item) => item.id)).not.toContain('dropped');
    expect(filterTodaySessions(sessions, 'UPCOMING').map((item) => item.id)).toEqual(['later', 'next']);
  });

  it('treats a paused session as in progress', () => {
    const paused = [session('paused', 'PAUSED', '11:00')];
    expect(filterTodaySessions(paused, 'IN_PROGRESS')).toHaveLength(1);
  });

  it('counts each filter for the chip badges', () => {
    expect(todayFilterCounts(sessions)).toEqual({ ALL: 4, IN_PROGRESS: 1, UPCOMING: 2, DONE: 1 });
  });

  it('groups by time and promotes the earliest planned session to Next', () => {
    const groups = groupTodaySessions(sessions.filter((item) => item.status !== 'IN_PROGRESS'));
    expect(groups.next.map((item) => item.id)).toEqual(['next']);
    expect(groups.later.map((item) => item.id)).toEqual(['later']);
    expect(groups.done.map((item) => item.id)).toEqual(['finished']);
  });

  it('leaves Next empty while a session is actually running', () => {
    const groups = groupTodaySessions(sessions);
    expect(groups.inProgress.map((item) => item.id)).toEqual(['running']);
    expect(groups.next).toEqual([]);
    expect(groups.later.map((item) => item.id)).toEqual(['next', 'later']);
  });
});
