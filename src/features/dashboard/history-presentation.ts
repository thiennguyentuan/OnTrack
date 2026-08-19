export type HistorySessionRow = {
  id: string;
  task_id: string;
  task_title?: string | null;
  estimated_minutes: number;
  actual_minutes?: number | null;
  ended_at?: string | null;
  planned_start_at?: string | null;
};

const DAY_LABELS = ['M', 'T', 'W', 'T', 'F', 'S', 'S'];
const DAY_MS = 86_400_000;

const minutesOf = (session: HistorySessionRow) => session.actual_minutes ?? session.estimated_minutes ?? 0;

const startOfDay = (value: Date) => new Date(value.getFullYear(), value.getMonth(), value.getDate());

/**
 * Focus minutes for the last 7 days, oldest first, so the bar chart shows real
 * per-day data instead of one repeated value.
 */
export function weeklyFocusSeries(sessions: HistorySessionRow[], now: Date = new Date()) {
  const today = startOfDay(now);
  const buckets = Array.from({ length: 7 }, (_, index) => {
    const date = new Date(today.getTime() - (6 - index) * DAY_MS);
    return { date, label: DAY_LABELS[(date.getDay() + 6) % 7], minutes: 0, isToday: index === 6 };
  });

  for (const session of sessions) {
    const stamp = session.ended_at ?? session.planned_start_at;
    if (!stamp) continue;
    const when = new Date(stamp);
    if (Number.isNaN(when.getTime())) continue;
    const index = Math.round((startOfDay(when).getTime() - today.getTime()) / DAY_MS) + 6;
    if (index >= 0 && index < 7) buckets[index].minutes += minutesOf(session);
  }

  const peak = Math.max(...buckets.map((bucket) => bucket.minutes), 0);
  return buckets.map((bucket) => ({
    ...bucket,
    /** 0..100, for a percentage-height bar. */
    height: peak > 0 ? Math.max(4, Math.round((bucket.minutes / peak) * 100)) : 0,
  }));
}

/** "12h 30m" — the format used by the Progress Dashboard wireframe. */
export function formatFocusDuration(totalMinutes: number) {
  const safe = Math.max(0, Math.round(totalMinutes));
  const hours = Math.floor(safe / 60);
  const minutes = safe % 60;
  if (!hours) return `${minutes}m`;
  return minutes ? `${hours}h ${minutes}m` : `${hours}h`;
}

export function summarizeSessionHistory(sessions: HistorySessionRow[]) {
  return sessions.reduce(
    (summary, session) => ({
      completedSessions: summary.completedSessions + 1,
      focusMinutes: summary.focusMinutes + (session.actual_minutes ?? session.estimated_minutes ?? 0),
    }),
    { completedSessions: 0, focusMinutes: 0 },
  );
}

export function toHistoryTasks(sessions: HistorySessionRow[]) {
  const tasks = new Map<string, { id: string; title: string; current_progress: number }>();
  for (const session of sessions) {
    if (!tasks.has(session.task_id)) {
      tasks.set(session.task_id, { id: session.task_id, title: session.task_title?.trim() || 'Focus Session', current_progress: 0 });
    }
  }
  return [...tasks.values()];
}
