import { describe, expect, it } from 'vitest';
import { apiIsReachable, call, ok, planSession, registerUser, seedHierarchy } from './rest-api';

const reachable = await apiIsReachable();

describe.skipIf(!reachable)('session lifecycle', () => {
  it('runs a session from planned to ended and keeps the task title throughout', async () => {
    const account = await registerUser();
    const { task } = await seedHierarchy(account.token);
    const session = await planSession(account.token, task.id);

    expect(session.status).toBe('PLANNED');
    expect(Number(session.progress_before)).toBe(0);

    const started = await ok(`/api/v3/sessions/${session.id}/start`, { method: 'POST', token: account.token });
    expect(started).toMatchObject({ status: 'IN_PROGRESS', task_title: 'UI Design' });
    expect(started.expected_end_at).toBeTruthy();

    const paused = await ok(`/api/v3/sessions/${session.id}/pause`, { method: 'POST', token: account.token });
    expect(paused).toMatchObject({ status: 'PAUSED', task_title: 'UI Design' });

    const resumed = await ok(`/api/v3/sessions/${session.id}/resume`, { method: 'POST', token: account.token });
    expect(resumed).toMatchObject({ status: 'IN_PROGRESS', task_title: 'UI Design' });

    const ended = await ok(`/api/v3/sessions/${session.id}/end?ended_early=true`, { method: 'POST', token: account.token });
    expect(ended).toMatchObject({ status: 'ENDED_EARLY', task_title: 'UI Design' });
  });

  it('gives back the remaining time on resume rather than a fresh full duration', async () => {
    const account = await registerUser();
    const { task } = await seedHierarchy(account.token);
    const session = await planSession(account.token, task.id, 45);

    const started = await ok(`/api/v3/sessions/${session.id}/start`, { method: 'POST', token: account.token });
    const originalEnd = Date.parse(started.expected_end_at);

    await ok(`/api/v3/sessions/${session.id}/pause`, { method: 'POST', token: account.token });
    await new Promise((resolve) => setTimeout(resolve, 2000));
    const resumed = await ok(`/api/v3/sessions/${session.id}/resume`, { method: 'POST', token: account.token });

    // The deadline moves by roughly the pause, not back to a full 45 minutes.
    const shift = (Date.parse(resumed.expected_end_at) - originalEnd) / 1000;
    expect(shift).toBeGreaterThan(1);
    expect(shift).toBeLessThan(15);
  });

  it('enforces the order of the lifecycle transitions', async () => {
    const account = await registerUser();
    const { task } = await seedHierarchy(account.token);
    const session = await planSession(account.token, task.id);

    expect((await call(`/api/v3/sessions/${session.id}/pause`, { method: 'POST', token: account.token })).status).toBe(400);
    expect((await call(`/api/v3/sessions/${session.id}/resume`, { method: 'POST', token: account.token })).status).toBe(400);
    expect((await call(`/api/v3/sessions/${session.id}/end`, { method: 'POST', token: account.token })).status).toBe(400);

    await ok(`/api/v3/sessions/${session.id}/start`, { method: 'POST', token: account.token });
    expect((await call(`/api/v3/sessions/${session.id}/start`, { method: 'POST', token: account.token })).status).toBe(400);
  });

  it('serves the history route rather than treating it as a session id', async () => {
    const account = await registerUser();
    const history = await ok('/api/v3/sessions/history', { token: account.token });
    expect(Array.isArray(history)).toBe(true);
  });

  it('blocks another account from touching a session', async () => {
    const owner = await registerUser();
    const intruder = await registerUser();
    const { task } = await seedHierarchy(owner.token);
    const session = await planSession(owner.token, task.id);

    expect((await call(`/api/v3/sessions/${session.id}`, { token: intruder.token })).status).toBe(404);
    expect((await call(`/api/v3/sessions/${session.id}/start`, { method: 'POST', token: intruder.token })).status).toBe(404);
    expect((await call(`/api/v3/sessions/${session.id}`, { method: 'DELETE', token: intruder.token })).status).toBe(404);
  });
});

describe.skipIf(!reachable)('session review and progress rollup', () => {
  const runSession = async (token: string, taskId: string) => {
    const session = await planSession(token, taskId);
    await ok(`/api/v3/sessions/${session.id}/start`, { method: 'POST', token });
    await ok(`/api/v3/sessions/${session.id}/end?ended_early=false`, { method: 'POST', token });
    return session;
  };

  it('rolls progress up from task to milestone to deadline', async () => {
    const account = await registerUser();
    const { deadline, task } = await seedHierarchy(account.token);
    const session = await runSession(account.token, task.id);

    const reviewed = await ok(`/api/v3/sessions/${session.id}/review`, {
      token: account.token,
      body: { progress_after: 40, actual_minutes: 48, result_note: 'Half of the layout' },
    });

    expect(Number(reviewed.task.current_progress)).toBe(40);
    expect(reviewed.task.status).toBe('IN_PROGRESS');
    expect(Number(reviewed.milestone.progress)).toBe(40);
    expect(Number(reviewed.deadline.progress)).toBe(40);
    expect(reviewed.can_create_follow_up).toBe(true);

    const detail = await ok(`/api/v3/deadlines/${deadline.id}`, { token: account.token });
    expect(Number(detail.progress)).toBe(40);
  });

  it('completes the task, milestone and deadline at 100%', async () => {
    const account = await registerUser();
    const { deadline, task } = await seedHierarchy(account.token);
    const session = await runSession(account.token, task.id);

    const reviewed = await ok(`/api/v3/sessions/${session.id}/review`, {
      token: account.token,
      body: { progress_after: 100, actual_minutes: 45, result_note: 'Finished' },
    });

    expect(reviewed.task.status).toBe('COMPLETED');
    expect(reviewed.milestone.status).toBe('COMPLETED');
    expect(Number(reviewed.deadline.progress)).toBe(100);
    expect(reviewed.can_create_follow_up).toBe(false);

    const [listed] = await ok('/api/v3/deadlines', { token: account.token });
    expect(listed.id).toBe(deadline.id);
    expect(listed.status).toBe('COMPLETED');
    expect(listed.risk_level).toBe('ON_TRACK');
  });

  it('refuses to move a task backwards', async () => {
    const account = await registerUser();
    const { task } = await seedHierarchy(account.token);

    const first = await runSession(account.token, task.id);
    await ok(`/api/v3/sessions/${first.id}/review`, { token: account.token, body: { progress_after: 60, actual_minutes: 40, result_note: null } });

    const second = await runSession(account.token, task.id);
    const backwards = await call(`/api/v3/sessions/${second.id}/review`, {
      token: account.token,
      body: { progress_after: 40, actual_minutes: 20, result_note: null },
    });
    expect(backwards.status).toBe(400);
  });

  it('refuses to review a session that has not ended', async () => {
    const account = await registerUser();
    const { task } = await seedHierarchy(account.token);
    const session = await planSession(account.token, task.id);

    const tooEarly = await call(`/api/v3/sessions/${session.id}/review`, {
      token: account.token,
      body: { progress_after: 50, actual_minutes: 20, result_note: null },
    });
    expect(tooEarly.status).toBe(400);
  });

  it('creates a follow-up that inherits the task and its current progress', async () => {
    const account = await registerUser();
    const { task } = await seedHierarchy(account.token);
    const session = await runSession(account.token, task.id);
    await ok(`/api/v3/sessions/${session.id}/review`, { token: account.token, body: { progress_after: 60, actual_minutes: 40, result_note: null } });

    const followUp = await ok('/api/v3/sessions', {
      token: account.token,
      body: { task_id: null, planned_start_at: new Date().toISOString(), estimated_minutes: 30, focus_mode: 'NORMAL', is_follow_up: true, previous_session_id: session.id },
    });

    expect(followUp.task_id).toBe(task.id);
    expect(Number(followUp.progress_before)).toBe(60);
  });

  it('will not open a follow-up on a finished task', async () => {
    const account = await registerUser();
    const { task } = await seedHierarchy(account.token);
    const session = await runSession(account.token, task.id);
    await ok(`/api/v3/sessions/${session.id}/review`, { token: account.token, body: { progress_after: 100, actual_minutes: 40, result_note: null } });

    const refused = await call('/api/v3/sessions', {
      token: account.token,
      body: { task_id: null, planned_start_at: new Date().toISOString(), estimated_minutes: 30, focus_mode: 'NORMAL', is_follow_up: true, previous_session_id: session.id },
    });
    expect(refused.status).toBe(400);
  });

  it('lists a reviewed session in history with its before and after progress', async () => {
    const account = await registerUser();
    const { task } = await seedHierarchy(account.token);
    const session = await runSession(account.token, task.id);
    await ok(`/api/v3/sessions/${session.id}/review`, { token: account.token, body: { progress_after: 70, actual_minutes: 52, result_note: 'Good run' } });

    const history = await ok('/api/v3/sessions/history', { token: account.token });
    expect(history).toHaveLength(1);
    expect(history[0]).toMatchObject({ task_title: 'UI Design', actual_minutes: 52, result_note: 'Good run' });
    expect(Number(history[0].progress_after)).toBe(70);
  });
});

describe.skipIf(!reachable)('today dashboard', () => {
  it('surfaces the next actionable session and the deadline that needs attention', async () => {
    const account = await registerUser();
    const { task } = await seedHierarchy(account.token, { dueInDays: 20, title: 'Final Year Project' });
    await planSession(account.token, task.id);

    const dashboard = await ok('/api/v3/dashboard/today', { token: account.token });
    expect(dashboard.sessions).toHaveLength(1);
    expect(dashboard.next_session).toMatchObject({ task_title: 'UI Design', status: 'PLANNED' });
    expect(dashboard.risk_card).toMatchObject({ title: 'Final Year Project', risk_level: 'AT_RISK' });
    expect(dashboard.risk_card.gap).toBeLessThan(0);
  });

  it('leaves the risk card empty when nothing is behind', async () => {
    const account = await registerUser();
    await seedHierarchy(account.token, { dueInDays: 300, title: 'Comfortable' });

    const dashboard = await ok('/api/v3/dashboard/today', { token: account.token });
    expect(dashboard.risk_card).toBeNull();
  });
});
