import { describe, expect, it } from 'vitest';
import { DEADLINE_TABS, toDeadlineDetailView } from '../../src/features/plans/deadline-detail-presentation';

describe('toDeadlineDetailView', () => {
  it('maps deadline progress and milestone/task status for the UX detail screen', () => {
    const view = toDeadlineDetailView({
      title: 'Mobile Final Project',
      due_at: '2026-09-02T23:59:59Z',
      status: 'AT_RISK',
      progress: 65,
      milestones: [{
        id: 'm1', title: 'UI Design', target_at: '2026-08-30T23:59:59Z', progress: 70, status: 'IN_PROGRESS',
        tasks: [{ id: 't1', title: 'Design Login', current_progress: 100 }, { id: 't2', title: 'Design Dashboard', current_progress: 40 }],
      }],
    });

    expect(view.statusLabel).toBe('AT RISK');
    expect(view.progress).toBe(65);
    expect(view.milestones[0]).toMatchObject({ title: 'UI Design', statusLabel: 'In Progress', progress: 70, taskCount: 2 });
    expect(view.milestones[0].tasks[0].completed).toBe(true);
    expect(view.milestones[0].tasks[1].completed).toBe(false);
  });

  it('exposes the three tabs from the detail wireframe', () => {
    expect(DEADLINE_TABS).toEqual(['MILESTONES', 'TASKS', 'SESSIONS']);
  });

  it('flattens tasks across milestones and keeps their milestone for context', () => {
    const view = toDeadlineDetailView({
      title: 'Final Year Project',
      due_at: '2026-09-08T23:59:59Z',
      progress: 40,
      milestones: [
        { id: 'm1', title: 'Design', target_at: '2026-08-25T00:00:00Z', tasks: [{ id: 't1', title: 'ERD', current_progress: 80 }] },
        { id: 'm2', title: 'Build', target_at: '2026-09-01T00:00:00Z', tasks: [{ id: 't2', title: 'API', current_progress: 0 }, { id: 't3', title: 'UI', current_progress: 100 }] },
      ],
    });

    expect(view.tasks.map((task) => task.title)).toEqual(['ERD', 'API', 'UI']);
    expect(view.tasks[1]).toMatchObject({ milestoneId: 'm2', milestoneTitle: 'Build' });
    expect(view.counts).toEqual({ milestones: 2, tasks: 3, sessions: 0 });
  });

  it('maps the session list for the Sessions tab', () => {
    const view = toDeadlineDetailView({
      title: 'Final Year Project',
      due_at: '2026-09-08T23:59:59Z',
      progress: 40,
      sessions: [
        { id: 's1', task_title: 'UI Design', planned_start_at: '2026-08-19T10:00:00Z', estimated_minutes: 45, actual_minutes: 48, focus_mode: 'HIGH', status: 'ENDED_EARLY', progress_before: 0, progress_after: 40 },
        { id: 's2', task_title: 'API', planned_start_at: '2026-08-20T10:00:00Z', estimated_minutes: 30, focus_mode: null, status: 'PLANNED', progress_before: 40, progress_after: null },
      ],
    });

    expect(view.sessions[0]).toMatchObject({ taskTitle: 'UI Design', minutes: 48, focusMode: 'HIGH', statusLabel: 'Ended Early', progressAfter: 40 });
    // A planned session has no result yet and falls back to its estimate.
    expect(view.sessions[1]).toMatchObject({ minutes: 30, focusMode: 'NORMAL', statusLabel: 'Planned', progressAfter: null });
    expect(view.counts.sessions).toBe(2);
  });
});
