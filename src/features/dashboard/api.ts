import { supabase } from '../../lib/supabase';
import { normalizeApiError } from '../../lib/api-error';

async function unwrap<T>(promise: PromiseLike<{ data: T | null; error: { code?: string; message?: string } | null }>): Promise<T> {
  const { data, error } = await promise;
  if (error) throw normalizeApiError(error);
  return data as T;
}

export type ReviewSessionInput = { p_session_id: string; p_progress_after: number; p_actual_minutes: number; p_result_note: string | null };
export type FollowUpSessionInput = { p_previous_session_id: string; p_planned_start_at: string; p_estimated_minutes: number; p_focus_mode: 'NORMAL' | 'HIGH' };
export const getTodayDashboard = (now = new Date().toISOString()) => unwrap(supabase.rpc('get_today_dashboard', { p_now: now }));
export const completeSessionReview = (input: ReviewSessionInput) => unwrap(supabase.rpc('complete_session_review', input));
export const createFollowUpSession = (input: FollowUpSessionInput) => unwrap(supabase.rpc('create_follow_up_session', input));
export const getSessionHistory = () => unwrap(supabase.from('sessions').select('*, tasks!inner(title)').in('status', ['COMPLETED', 'ENDED_EARLY', 'SKIPPED']).order('ended_at', { ascending: false }));
export const getDeadlineRisk = (id: string) => unwrap(supabase.rpc('get_deadline_risk', { p_deadline_id: id }));
