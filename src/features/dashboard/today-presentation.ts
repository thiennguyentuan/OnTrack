export type TodayFilter = 'ALL' | 'IN_PROGRESS' | 'UPCOMING' | 'DONE';

export type TodaySession = {
  id: string;
  task_title?: string | null;
  planned_start_at: string;
  estimated_minutes: number;
  focus_mode?: string | null;
  status: string;
  ended_at?: string | null;
};

export const TODAY_FILTERS: { key: TodayFilter; label: string }[] = [
  { key: 'ALL', label: 'All' },
  { key: 'IN_PROGRESS', label: 'In Progress' },
  { key: 'UPCOMING', label: 'Upcoming' },
  { key: 'DONE', label: 'Done' },
];

const RUNNING = ['IN_PROGRESS', 'PAUSED'];
const DONE = ['COMPLETED', 'ENDED_EARLY', 'SKIPPED'];

/** Cancelled sessions are history, not part of today's plan. */
const visible = (session: TodaySession) => session.status !== 'CANCELLED';

export function matchesTodayFilter(session: TodaySession, filter: TodayFilter) {
  if (!visible(session)) return false;
  switch (filter) {
    case 'IN_PROGRESS': return RUNNING.includes(session.status);
    case 'UPCOMING': return session.status === 'PLANNED';
    case 'DONE': return DONE.includes(session.status);
    default: return true;
  }
}

export function filterTodaySessions(sessions: TodaySession[], filter: TodayFilter) {
  return sessions.filter((session) => matchesTodayFilter(session, filter));
}

export function todayFilterCounts(sessions: TodaySession[]) {
  return TODAY_FILTERS.reduce(
    (counts, { key }) => ({ ...counts, [key]: filterTodaySessions(sessions, key).length }),
    {} as Record<TodayFilter, number>,
  );
}

const byTime = (a: TodaySession, b: TodaySession) =>
  Date.parse(a.planned_start_at) - Date.parse(b.planned_start_at);

/**
 * The three groups the Today wireframe shows: what is running right now,
 * the one to start next, and everything else still ahead today.
 */
export function groupTodaySessions(sessions: TodaySession[]) {
  const shown = sessions.filter(visible).sort(byTime);
  const inProgress = shown.filter((session) => RUNNING.includes(session.status));
  const planned = shown.filter((session) => session.status === 'PLANNED');
  return {
    inProgress,
    next: inProgress.length ? [] : planned.slice(0, 1),
    later: inProgress.length ? planned : planned.slice(1),
    done: shown.filter((session) => DONE.includes(session.status)),
  };
}

export function formatSessionTime(value: string) {
  const parsed = new Date(value);
  return Number.isNaN(parsed.getTime())
    ? '--:--'
    : parsed.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
}
