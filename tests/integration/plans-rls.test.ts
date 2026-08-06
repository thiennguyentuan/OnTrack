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

describe.skipIf(!anonKey)('planning hierarchy RLS', () => {
  it('rejects a milestone whose target date exceeds its deadline due date', async () => {
    const { client } = await register('Planner A');
    const deadline = await client
      .from('deadlines')
      .insert({
        title: 'Ship planning API',
        due_at: '2031-01-01T00:00:00Z',
        priority: 'HIGH',
      })
      .select('id')
      .single();

    expect(deadline.error).toBeNull();

    const { error } = await client.from('milestones').insert({
      deadline_id: deadline.data!.id,
      title: 'Late milestone',
      target_at: '2031-01-02T00:00:00Z',
    });

    expect(error?.code).toBe('23514');
  });

  it('prevents another user from reading a deadline hierarchy', async () => {
    const owner = await register('Owner');
    const stranger = await register('Stranger');

    const deadline = await owner.client
      .from('deadlines')
      .insert({
        title: 'Protected deadline',
        due_at: '2031-02-01T00:00:00Z',
        priority: 'MEDIUM',
      })
      .select('id')
      .single();

    expect(deadline.error).toBeNull();

    const milestone = await owner.client
      .from('milestones')
      .insert({
        deadline_id: deadline.data!.id,
        title: 'Protected milestone',
        target_at: '2031-01-20T00:00:00Z',
      })
      .select('id')
      .single();

    expect(milestone.error).toBeNull();

    const task = await owner.client
      .from('tasks')
      .insert({
        milestone_id: milestone.data!.id,
        title: 'Protected task',
        priority: 'LOW',
      })
      .select('id')
      .single();

    expect(task.error).toBeNull();

    const deadlineRead = await stranger.client
      .from('deadlines')
      .select('id')
      .eq('id', deadline.data!.id);
    const milestoneRead = await stranger.client
      .from('milestones')
      .select('id')
      .eq('id', milestone.data!.id);
    const taskRead = await stranger.client
      .from('tasks')
      .select('id')
      .eq('id', task.data!.id);

    expect(deadlineRead.error).toBeNull();
    expect(deadlineRead.data).toEqual([]);
    expect(milestoneRead.error).toBeNull();
    expect(milestoneRead.data).toEqual([]);
    expect(taskRead.error).toBeNull();
    expect(taskRead.data).toEqual([]);
  });

  it('prevents another user from creating a task beneath someone else’s milestone', async () => {
    const owner = await register('Owner');
    const stranger = await register('Stranger');

    const deadline = await owner.client
      .from('deadlines')
      .insert({
        title: 'Nested ownership',
        due_at: '2031-03-01T00:00:00Z',
        priority: 'HIGH',
      })
      .select('id')
      .single();

    expect(deadline.error).toBeNull();

    const milestone = await owner.client
      .from('milestones')
      .insert({
        deadline_id: deadline.data!.id,
        title: 'Owner milestone',
        target_at: '2031-02-20T00:00:00Z',
      })
      .select('id')
      .single();

    expect(milestone.error).toBeNull();

    const { error } = await stranger.client.from('tasks').insert({
      milestone_id: milestone.data!.id,
      title: 'Cross-account task',
      priority: 'HIGH',
    });

    expect(error?.code).toBe('42501');
  });
});
