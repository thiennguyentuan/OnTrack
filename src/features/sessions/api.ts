import { supabase } from '../../lib/supabase';
import { normalizeApiError } from '../../lib/api-error';

async function unwrap<T>(promise: PromiseLike<{ data: T | null; error: { code?: string; message?: string } | null }>): Promise<T> {
  const { data, error } = await promise;
  if (error) throw normalizeApiError(error);
  return data as T;
}

export type CreateSessionInput = { task_id: string; planned_start_at: string; estimated_minutes: number; focus_mode: 'NORMAL' | 'HIGH'; is_follow_up?: boolean; previous_session_id?: string | null };
export const createSession = (input: CreateSessionInput) => unwrap(supabase.from('sessions').insert(input).select().single());
export const getSession = (id: string) => unwrap(supabase.from('sessions').select('*, tasks!inner(id,title,current_progress,milestones!inner(id,deadline_id))').eq('id', id).single());
export const getTodaySessions = () => unwrap(supabase.from('sessions').select('*').gte('planned_start_at', new Date().toISOString().slice(0, 10)).order('planned_start_at'));
const rpc = <T>(name: string, args: Record<string, unknown>) => unwrap(supabase.rpc(name, args));
export const startSession = (id: string) => rpc('start_session', { p_session_id: id });
export const pauseSession = (id: string) => rpc('pause_session', { p_session_id: id });
export const resumeSession = (id: string) => rpc('resume_session', { p_session_id: id });
export const endSession = (id: string, endedEarly: boolean) => rpc('end_session', { p_session_id: id, p_ended_early: endedEarly });
export const rescheduleSession = (id: string, planned_start_at: string) => unwrap(supabase.from('sessions').update({ planned_start_at }).eq('id', id).select().single());
export const cancelSession = (id: string) => unwrap(supabase.from('sessions').update({ status: 'CANCELLED' }).eq('id', id).select().single());
