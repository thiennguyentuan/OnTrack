import { describe, expect, it } from 'vitest';
import { apiIsReachable, call, ok, registerUser, seedHierarchy } from './rest-api';

const reachable = await apiIsReachable();

describe.skipIf(!reachable)('auth and account ownership', () => {
  it('registers, signs in, and returns the same profile from the token', async () => {
    const account = await registerUser();

    const signedIn = await ok('/api/v3/auth/login', { body: { email: account.email, password: account.password } });
    expect(signedIn.user.email).toBe(account.email);

    const profile = await ok('/api/v3/users/me', { token: signedIn.token });
    expect(profile).toMatchObject({ email: account.email, full_name: 'Integration User' });
  });

  it('refuses a duplicate email and a wrong password', async () => {
    const account = await registerUser();

    const duplicate = await call('/api/v3/auth/register', {
      body: { email: account.email, password: 'another-pass', full_name: 'Someone Else' },
    });
    expect(duplicate.status).toBe(409);

    const wrong = await call('/api/v3/auth/login', { body: { email: account.email, password: 'not-the-password' } });
    expect(wrong.status).toBe(401);
  });

  it('rejects every protected route without a valid token', async () => {
    for (const path of ['/api/v3/users/me', '/api/v3/deadlines', '/api/v3/sessions/history', '/api/v3/tasks']) {
      expect((await call(path)).status, path).toBe(401);
      expect((await call(path, { token: 'not-a-real-token' })).status, path).toBe(401);
    }
  });

  it('changes the password only when the current one is right', async () => {
    const account = await registerUser();

    const wrongCurrent = await call('/api/v3/auth/change-password', {
      token: account.token,
      body: { current_password: 'wrong', new_password: 'a-brand-new-pass' },
    });
    expect(wrongCurrent.status).toBe(400);

    const reused = await call('/api/v3/auth/change-password', {
      token: account.token,
      body: { current_password: account.password, new_password: account.password },
    });
    expect(reused.status).toBe(400);

    await ok('/api/v3/auth/change-password', {
      token: account.token,
      body: { current_password: account.password, new_password: 'a-brand-new-pass' },
    });

    expect((await call('/api/v3/auth/login', { body: { email: account.email, password: account.password } })).status).toBe(401);
    expect((await call('/api/v3/auth/login', { body: { email: account.email, password: 'a-brand-new-pass' } })).status).toBe(200);
  });

  it('keeps one account out of another account data', async () => {
    const owner = await registerUser();
    const intruder = await registerUser();
    const { deadline, milestone, task } = await seedHierarchy(owner.token);

    // Reading someone else's records
    expect((await call(`/api/v3/deadlines/${deadline.id}`, { token: intruder.token })).status).toBe(404);
    expect((await call(`/api/v3/milestones/${milestone.id}`, { token: intruder.token })).status).toBe(404);
    expect((await call(`/api/v3/tasks/${task.id}`, { token: intruder.token })).status).toBe(404);

    // Writing beneath them
    const stolenMilestone = await call('/api/v3/milestones', {
      token: intruder.token,
      body: { deadline_id: deadline.id, title: 'Injected', target_at: new Date().toISOString() },
    });
    expect(stolenMilestone.status).toBe(404);

    const stolenTask = await call('/api/v3/tasks', {
      token: intruder.token,
      body: { milestone_id: milestone.id, title: 'Injected', priority: 'LOW' },
    });
    expect(stolenTask.status).toBe(404);

    // And the owner's list stays clean
    const intruderDeadlines = await ok('/api/v3/deadlines', { token: intruder.token });
    expect(intruderDeadlines).toHaveLength(0);
  });

  it('updates the profile fields the account screen edits', async () => {
    const account = await registerUser();
    const updated = await ok('/api/v3/users/me', {
      method: 'PUT',
      token: account.token,
      body: { full_name: 'Renamed Student', timezone: 'Asia/Bangkok' },
    });
    expect(updated).toMatchObject({ full_name: 'Renamed Student', timezone: 'Asia/Bangkok' });
  });
});
