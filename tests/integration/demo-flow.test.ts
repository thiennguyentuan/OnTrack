import { createClient } from '@supabase/supabase-js';
import { describe, expect, it } from 'vitest';

const url = process.env.SUPABASE_URL ?? 'http://127.0.0.1:54321';
const anonKey = process.env.SUPABASE_ANON_KEY ?? '';

describe.skipIf(!anonKey)('complete demo flow', () => {
  it('runs registration through reviewed follow-up session', async () => {
    const client = createClient(url, anonKey, { auth: { persistSession: false } });
    const email = `demo-${crypto.randomUUID()}@ontrack.local`;
    const signedUp = await client.auth.signUp({ email, password: 'OnTrack-test-123!', options: { data: { full_name: 'Demo Flow' } } });
    expect(signedUp.error).toBeNull();
    const deadline = await client.from('deadlines').insert({ title: 'Demo', due_at: '2031-05-01T00:00:00Z', priority: 'HIGH' }).select('id').single();
    expect(deadline.error).toBeNull();
    const milestone = await client.from('milestones').insert({ deadline_id: deadline.data!.id, title: 'Milestone', target_at: '2031-04-20T00:00:00Z' }).select('id').single();
    const task = await client.from('tasks').insert({ milestone_id: milestone.data!.id, title: 'Task', priority: 'HIGH' }).select('id').single();
    const session = await client.from('sessions').insert({ task_id: task.data!.id, planned_start_at: '2031-04-01T09:00:00Z', estimated_minutes: 45, focus_mode: 'NORMAL' }).select('id').single();
    expect(session.error).toBeNull();
    expect((await client.rpc('start_session', { p_session_id: session.data!.id })).error).toBeNull();
    expect((await client.rpc('end_session', { p_session_id: session.data!.id, p_ended_early: true })).error).toBeNull();
    const review = await client.rpc('complete_session_review', { p_session_id: session.data!.id, p_progress_after: 40, p_actual_minutes: 45, p_result_note: 'First pass' });
    expect(review.error).toBeNull();
    const followUp = await client.rpc('create_follow_up_session', { p_previous_session_id: session.data!.id, p_planned_start_at: '2031-04-02T09:00:00Z', p_estimated_minutes: 30, p_focus_mode: 'HIGH' });
    expect(followUp.error).toBeNull();
    expect(followUp.data.progress_before).toBe(40);
  });
});
