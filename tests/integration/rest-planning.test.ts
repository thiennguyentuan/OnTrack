import { describe, expect, it } from 'vitest';
import { apiIsReachable, call, inDays, ok, registerUser, seedHierarchy } from './rest-api';

const reachable = await apiIsReachable();

describe.skipIf(!reachable)('planning hierarchy', () => {
  it('creates a deadline with milestones and tasks and reads them back nested', async () => {
    const account = await registerUser();
    const { deadline, milestone, task } = await seedHierarchy(account.token);

    const detail = await ok(`/api/v3/deadlines/${deadline.id}`, { token: account.token });
    expect(detail.milestones).toHaveLength(1);
    expect(detail.milestones[0].id).toBe(milestone.id);
    expect(detail.milestones[0].tasks[0].id).toBe(task.id);
    // The Sessions tab reads this flat list rather than one request per task.
    expect(Array.isArray(detail.sessions)).toBe(true);
  });

  it('derives risk on read instead of trusting the stored column', async () => {
    const account = await registerUser();
    // No progress with only 20 days left: well behind the expected pace.
    await seedHierarchy(account.token, { dueInDays: 20, title: 'Behind Schedule' });

    const [listed] = await ok('/api/v3/deadlines', { token: account.token });
    expect(listed.risk_level).toBe('AT_RISK');
    expect(listed.status).toBe('AT_RISK');
    expect(listed.expected_progress).toBeGreaterThan(Number(listed.progress));
    expect(listed.gap).toBeLessThan(0);
  });

  it('reports a comfortable deadline as on track', async () => {
    const account = await registerUser();
    await seedHierarchy(account.token, { dueInDays: 300, title: 'Plenty Of Time' });

    const [listed] = await ok('/api/v3/deadlines', { token: account.token });
    expect(listed.risk_level).toBe('ON_TRACK');
    expect(listed.status).toBe('PLANNING');
  });

  it('flags a past-due deadline as overdue', async () => {
    const account = await registerUser();
    await ok('/api/v3/deadlines', {
      token: account.token,
      body: { title: 'Missed It', due_at: inDays(-2), priority: 'HIGH' },
    });

    const [listed] = await ok('/api/v3/deadlines', { token: account.token });
    expect(listed.risk_level).toBe('OVERDUE');
    expect(listed.status).toBe('OVERDUE');
  });

  it('returns the risk breakdown the Risk Detail screen renders', async () => {
    const account = await registerUser();
    const { deadline } = await seedHierarchy(account.token, { dueInDays: 20, title: 'Final Year Project' });

    const risk = await ok(`/api/v3/deadlines/${deadline.id}/risk`, { token: account.token });
    expect(risk).toMatchObject({ title: 'Final Year Project', risk_level: 'AT_RISK' });
    expect(risk.due_at).toBeTruthy();
    expect(risk.next_action).toBeTruthy();
    expect(typeof risk.gap).toBe('number');
  });

  it('lists open tasks for the session picker and hides completed ones', async () => {
    const account = await registerUser();
    const { milestone, task } = await seedHierarchy(account.token);
    const second = await ok('/api/v3/tasks', {
      token: account.token,
      body: { milestone_id: milestone.id, title: 'API Integration', priority: 'MEDIUM' },
    });

    const open = await ok('/api/v3/tasks', { token: account.token });
    expect(open.map((item: any) => item.id).sort()).toEqual([task.id, second.id].sort());
    expect(open[0]).toHaveProperty('deadline_title');
    expect(open[0]).toHaveProperty('milestone_title');

    // Drive one task to 100% and it drops out of the picker.
    const session = await ok('/api/v3/sessions', {
      token: account.token,
      body: { task_id: task.id, planned_start_at: new Date().toISOString(), estimated_minutes: 30, focus_mode: 'NORMAL' },
    });
    await ok(`/api/v3/sessions/${session.id}/start`, { method: 'POST', token: account.token });
    await ok(`/api/v3/sessions/${session.id}/end?ended_early=false`, { method: 'POST', token: account.token });
    await ok(`/api/v3/sessions/${session.id}/review`, {
      token: account.token,
      body: { progress_after: 100, actual_minutes: 30, result_note: 'done' },
    });

    const stillOpen = await ok('/api/v3/tasks', { token: account.token });
    expect(stillOpen.map((item: any) => item.id)).toEqual([second.id]);
    expect((await ok('/api/v3/tasks?include_completed=true', { token: account.token }))).toHaveLength(2);
  });

  it('edits and deletes through the hierarchy', async () => {
    const account = await registerUser();
    const { deadline, milestone, task } = await seedHierarchy(account.token);

    expect((await ok(`/api/v3/deadlines/${deadline.id}`, { method: 'PUT', token: account.token, body: { title: 'Renamed' } })).title).toBe('Renamed');
    expect((await ok(`/api/v3/milestones/${milestone.id}`, { method: 'PUT', token: account.token, body: { title: 'Renamed Milestone' } })).title).toBe('Renamed Milestone');
    expect((await ok(`/api/v3/tasks/${task.id}`, { method: 'PUT', token: account.token, body: { priority: 'LOW' } })).priority).toBe('LOW');

    await ok(`/api/v3/deadlines/${deadline.id}`, { method: 'DELETE', token: account.token });
    expect((await call(`/api/v3/deadlines/${deadline.id}`, { token: account.token })).status).toBe(404);
    // Deleting the deadline takes its milestones and tasks with it.
    expect((await call(`/api/v3/tasks/${task.id}`, { token: account.token })).status).toBe(404);
  });
});
