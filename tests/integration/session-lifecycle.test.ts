import { createClient } from '@supabase/supabase-js';
import { describe, expect, it } from 'vitest';

const url = process.env.SUPABASE_URL ?? 'http://127.0.0.1:54321';
const anonKey = process.env.SUPABASE_ANON_KEY ?? '';

async function register(label: string) {
  if (!anonKey) {
    throw new Error('SUPABASE_ANON_KEY is required for local integration tests');
  }

  const client = createClient(url, anonKey, { auth: { persistSession: false } });
  const email = `${label}-${crypto.randomUUID()}@ontrack.local`;
  const { data, error } = await client.auth.signUp({
    email,
    password: 'OnTrack-test-123!',
    options: { data: { full_name: label } },
  });

  if (error || !data.user) {
    throw error ?? new Error('Registration returned no user');
  }

  return { client, userId: data.user.id };
}

async function createOwnedTask(label: string) {
  const owner = await register(label);

  const deadline = await owner.client
    .from('deadlines')
    .insert({
      title: `${label} deadline`,
      due_at: '2031-04-05T00:00:00Z',
      priority: 'HIGH',
    })
    .select('id')
    .single();

  expect(deadline.error).toBeNull();

  const milestone = await owner.client
    .from('milestones')
    .insert({
      deadline_id: deadline.data!.id,
      title: `${label} milestone`,
      target_at: '2031-04-03T00:00:00Z',
    })
    .select('id')
    .single();

  expect(milestone.error).toBeNull();

  const task = await owner.client
    .from('tasks')
    .insert({
      milestone_id: milestone.data!.id,
      title: `${label} task`,
      priority: 'MEDIUM',
    })
    .select('id,current_progress')
    .single();

  expect(task.error).toBeNull();

  const updatedTask = await owner.client
    .from('tasks')
    .update({ current_progress: 40, status: 'IN_PROGRESS' })
    .eq('id', task.data!.id)
    .select('id,current_progress')
    .single();

  expect(updatedTask.error).toBeNull();

  return { owner, taskId: updatedTask.data!.id };
}

async function createPlannedSession(label: string) {
  const { owner, taskId } = await createOwnedTask(label);

  const session = await owner.client
    .from('sessions')
    .insert({
      task_id: taskId,
      planned_start_at: '2031-04-02T09:00:00Z',
      estimated_minutes: 45,
      focus_mode: 'HIGH',
    })
    .select('id,task_id,status')
    .single();

  expect(session.error).toBeNull();

  return { owner, taskId, sessionId: session.data!.id };
}

describe('session lifecycle RPCs', () => {
  it('starts a planned session using the task current progress', async () => {
    const { owner, sessionId } = await createPlannedSession('Starter');

    const { data, error } = await owner.client.rpc('start_session', { p_session_id: sessionId });

    expect(error).toBeNull();
    expect(data?.status).toBe('IN_PROGRESS');
    expect(data?.progress_before).toBe(40);
    expect(data?.started_at).not.toBeNull();
    expect(data?.expected_end_at).not.toBeNull();
  });

  it('rejects starting a non-planned session', async () => {
    const { owner, sessionId } = await createPlannedSession('Restart');

    const firstStart = await owner.client.rpc('start_session', { p_session_id: sessionId });
    expect(firstStart.error).toBeNull();

    const secondStart = await owner.client.rpc('start_session', { p_session_id: sessionId });

    expect(secondStart.error?.message).toContain('PLANNED');
  });

  it('pauses, resumes, and ends an owned session while blocking other users', async () => {
    const { owner, sessionId } = await createPlannedSession('Lifecycle');
    const stranger = await register('Stranger');

    const started = await owner.client.rpc('start_session', { p_session_id: sessionId });
    expect(started.error).toBeNull();

    const blockedPause = await stranger.client.rpc('pause_session', { p_session_id: sessionId });
    expect(blockedPause.error?.code).toBe('42501');

    const paused = await owner.client.rpc('pause_session', { p_session_id: sessionId });
    expect(paused.error).toBeNull();
    expect(paused.data?.status).toBe('PAUSED');

    const resumed = await owner.client.rpc('resume_session', { p_session_id: sessionId });
    expect(resumed.error).toBeNull();
    expect(resumed.data?.status).toBe('IN_PROGRESS');

    const ended = await owner.client.rpc('end_session', {
      p_session_id: sessionId,
      p_ended_early: true,
    });

    expect(ended.error).toBeNull();
    expect(ended.data?.status).toBe('ENDED_EARLY');
    expect(ended.data?.ended_at).not.toBeNull();
  });
});
