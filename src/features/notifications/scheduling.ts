import type { NotificationPreferences } from '../settings/preferences';

export type SchedulableSession = {
  id: string;
  task_title?: string | null;
  planned_start_at: string;
  estimated_minutes: number;
  focus_mode?: string | null;
  status: string;
};

export type SchedulableDeadline = {
  id: string;
  title: string;
  due_at: string;
  progress?: number | null;
  risk_level?: string | null;
};

export type PlannedNotification = {
  /** Stable key. Re-planning produces the same key for the same event, so a
   *  rescheduled plan replaces the old one instead of stacking duplicates. */
  key: string;
  title: string;
  body: string;
  fireAt: Date;
  route: string;
};

const MINUTE = 60_000;
const DAY = 86_400_000;

const at = (base: Date, hour: number) =>
  new Date(base.getFullYear(), base.getMonth(), base.getDate(), hour, 0, 0, 0);

/** The next time today's clock passes `hour`; tomorrow if it already has. */
export function nextOccurrenceOfHour(hour: number, now: Date) {
  const today = at(now, hour);
  return today.getTime() > now.getTime() ? today : new Date(today.getTime() + DAY);
}

/** The next Monday at `hour`, used for the weekly report. */
export function nextMondayAt(hour: number, now: Date) {
  const candidate = at(now, hour);
  const daysUntilMonday = (8 - candidate.getDay()) % 7;
  const monday = new Date(candidate.getTime() + daysUntilMonday * DAY);
  return monday.getTime() > now.getTime() ? monday : new Date(monday.getTime() + 7 * DAY);
}

const describeSession = (session: SchedulableSession) =>
  `${session.task_title ?? 'Focus session'} · ${session.estimated_minutes} min${session.focus_mode === 'HIGH' ? ' · High Focus' : ''}`;

export function planSessionReminders(sessions: SchedulableSession[], preferences: NotificationPreferences, now: Date) {
  if (!preferences.sessionReminders) return [];
  const lead = Math.max(0, preferences.sessionReminderMinutes) * MINUTE;
  return sessions
    .filter((session) => session.status === 'PLANNED')
    .map((session) => ({ session, fireAt: new Date(Date.parse(session.planned_start_at) - lead) }))
    .filter(({ fireAt }) => !Number.isNaN(fireAt.getTime()) && fireAt.getTime() > now.getTime())
    .map(({ session, fireAt }) => ({
      key: `session-${session.id}`,
      title: 'Focus session starting soon',
      body: describeSession(session),
      fireAt,
      route: `/session/${session.id}`,
    }));
}

export function planDeadlineAlerts(deadlines: SchedulableDeadline[], preferences: NotificationPreferences, now: Date) {
  if (!preferences.upcomingDeadline) return [];
  const lead = Math.max(0, preferences.deadlineAlertDays) * DAY;
  return deadlines
    .filter((deadline) => Number(deadline.progress ?? 0) < 100)
    .map((deadline) => ({ deadline, fireAt: new Date(Date.parse(deadline.due_at) - lead) }))
    .filter(({ fireAt }) => !Number.isNaN(fireAt.getTime()) && fireAt.getTime() > now.getTime())
    .map(({ deadline, fireAt }) => ({
      key: `deadline-${deadline.id}`,
      title: 'Deadline coming up',
      body: `${deadline.title} is due in ${preferences.deadlineAlertDays} day${preferences.deadlineAlertDays === 1 ? '' : 's'}.`,
      fireAt,
      route: `/deadline/${deadline.id}`,
    }));
}

export function planRiskAlerts(deadlines: SchedulableDeadline[], preferences: NotificationPreferences, now: Date) {
  if (!preferences.riskAlerts) return [];
  const fireAt = nextOccurrenceOfHour(8, now);
  return deadlines
    .filter((deadline) => deadline.risk_level === 'AT_RISK' || deadline.risk_level === 'OVERDUE')
    .map((deadline) => ({
      key: `risk-${deadline.id}`,
      title: deadline.risk_level === 'OVERDUE' ? 'Deadline overdue' : 'Deadline falling behind',
      body: `${deadline.title} is behind the pace it needs. Open it to plan the next session.`,
      fireAt,
      route: `/risk/${deadline.id}`,
    }));
}

export function planDigests(preferences: NotificationPreferences, now: Date): PlannedNotification[] {
  const planned: PlannedNotification[] = [];
  if (preferences.dailyDigest) {
    planned.push({
      key: 'daily-digest',
      title: 'Your day on OnTrack',
      body: 'Review the sessions you planned for today.',
      fireAt: nextOccurrenceOfHour(preferences.dailyDigestHour, now),
      route: '/(tabs)/today',
    });
  }
  if (preferences.weeklyReport) {
    planned.push({
      key: 'weekly-report',
      title: 'Your week in focus',
      body: 'See how much focus time you logged and which deadlines moved.',
      fireAt: nextMondayAt(preferences.dailyDigestHour, now),
      route: '/(tabs)/progress',
    });
  }
  return planned;
}

/**
 * The complete set of local notifications the app should have scheduled right now.
 * `allowAll` is the master switch, matching the settings screen.
 */
export function buildNotificationPlan(input: {
  sessions: SchedulableSession[];
  deadlines: SchedulableDeadline[];
  preferences: NotificationPreferences;
  now?: Date;
}): PlannedNotification[] {
  const now = input.now ?? new Date();
  if (!input.preferences.allowAll) return [];
  return [
    ...planSessionReminders(input.sessions, input.preferences, now),
    ...planDeadlineAlerts(input.deadlines, input.preferences, now),
    ...planRiskAlerts(input.deadlines, input.preferences, now),
    ...planDigests(input.preferences, now),
  ].sort((a, b) => a.fireAt.getTime() - b.fireAt.getTime());
}

/** Where a tapped notification should land. Falls back to Today for unknown payloads. */
export function routeForNotification(data: unknown) {
  const route = (data as { route?: unknown } | null)?.route;
  return typeof route === 'string' && route.startsWith('/') ? route : '/(tabs)/today';
}
