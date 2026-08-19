type DetailTaskSource = { id: string; title: string; current_progress?: number | null; priority?: string | null };
type DetailMilestoneSource = { id: string; title: string; target_at: string; progress?: number | null; status?: string | null; tasks?: DetailTaskSource[] };
type DetailSessionSource = {
  id: string; task_title?: string | null; planned_start_at: string; estimated_minutes: number;
  actual_minutes?: number | null; focus_mode?: string | null; status: string;
  progress_before?: number | null; progress_after?: number | null;
};
export type DeadlineDetailSource = {
  title: string; due_at: string; status?: string | null; progress?: number | null;
  milestones?: DetailMilestoneSource[]; sessions?: DetailSessionSource[];
};

// The API averages child progress, so values arrive as 45.833333.
const pct = (value: unknown) => Math.round(Math.max(0, Math.min(100, Number(value ?? 0))));

const labelize = (value?: string | null) => (value ?? 'PLANNING').replaceAll('_', ' ').toLowerCase().replace(/\b\w/g, (letter) => letter.toUpperCase());

export function toDeadlineDetailView(deadline: DeadlineDetailSource) {
  const milestones = (deadline.milestones ?? []).map((milestone) => ({
    id: milestone.id,
    title: milestone.title,
    targetAt: milestone.target_at,
    progress: pct(milestone.progress),
    statusLabel: labelize(milestone.status),
    taskCount: milestone.tasks?.length ?? 0,
    tasks: (milestone.tasks ?? []).map((task) => ({
      id: task.id,
      title: task.title,
      progress: pct(task.current_progress),
      completed: Number(task.current_progress ?? 0) >= 100,
    })),
  }));

  // The Tasks tab shows every task in the deadline, keeping its milestone for context.
  const tasks = milestones.flatMap((milestone) =>
    milestone.tasks.map((task) => ({ ...task, milestoneId: milestone.id, milestoneTitle: milestone.title })),
  );

  const sessions = (deadline.sessions ?? []).map((session) => ({
    id: session.id,
    taskTitle: session.task_title ?? 'Focus session',
    plannedStartAt: session.planned_start_at,
    minutes: session.actual_minutes ?? session.estimated_minutes,
    focusMode: session.focus_mode === 'HIGH' ? 'HIGH' : 'NORMAL',
    status: session.status,
    statusLabel: labelize(session.status),
    progressBefore: pct(session.progress_before),
    progressAfter: session.progress_after == null ? null : pct(session.progress_after),
  }));

  return {
    title: deadline.title,
    dueAt: deadline.due_at,
    statusLabel: labelize(deadline.status).toUpperCase(),
    progress: pct(deadline.progress),
    milestones,
    tasks,
    sessions,
    counts: { milestones: milestones.length, tasks: tasks.length, sessions: sessions.length },
  };
}

export const DEADLINE_TABS = ['MILESTONES', 'TASKS', 'SESSIONS'] as const;
export type DeadlineTab = (typeof DEADLINE_TABS)[number];
