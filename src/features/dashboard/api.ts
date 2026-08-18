import { apiRequest } from '../../lib/api-client';
export type ReviewSessionInput = { p_session_id: string; p_progress_after: number; p_actual_minutes: number; p_result_note: string | null };
export type FollowUpSessionInput = { p_previous_session_id: string; p_planned_start_at: string; p_estimated_minutes: number; p_focus_mode: 'NORMAL' | 'HIGH' };
export const getTodayDashboard = () => apiRequest('/api/v3/dashboard/today');
export const completeSessionReview = (input: ReviewSessionInput) => apiRequest(`/api/v3/sessions/${input.p_session_id}/review`, { method: 'POST', body: JSON.stringify({ progress_after: input.p_progress_after, actual_minutes: input.p_actual_minutes, result_note: input.p_result_note }) });
export const createFollowUpSession = (input: FollowUpSessionInput) => apiRequest('/api/v3/sessions', { method: 'POST', body: JSON.stringify({ task_id: null, planned_start_at: input.p_planned_start_at, estimated_minutes: input.p_estimated_minutes, focus_mode: input.p_focus_mode, is_follow_up: true, previous_session_id: input.p_previous_session_id }) });
export const getSessionHistory = () => apiRequest('/api/v3/sessions/history');
export const getDeadlineRisk = (id: string) => apiRequest(`/api/v3/deadlines/${id}/risk`);
