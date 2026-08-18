export type ApiTestStep = 'auth' | 'plan' | 'session' | 'focus' | 'review' | 'followUp' | 'done';

export type ApiTestFlowState = {
  userId?: string;
  taskId?: string;
  sessionId?: string;
  focusEnded?: boolean;
  reviewSaved?: boolean;
  followUpId?: string;
};

export function getNextApiTestStep(state: ApiTestFlowState): ApiTestStep {
  if (!state.userId) return 'auth';
  if (!state.taskId) return 'plan';
  if (!state.sessionId) return 'session';
  if (!state.focusEnded) return 'focus';
  if (!state.reviewSaved) return 'review';
  if (!state.followUpId) return 'followUp';
  return 'done';
}
