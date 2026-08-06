import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import * as api from './api';

export const useSessionQuery = (id: string) => useQuery({ queryKey: ['session', id], queryFn: () => api.getSession(id), enabled: Boolean(id) });
export const useTodaySessionsQuery = () => useQuery({ queryKey: ['today'], queryFn: api.getTodaySessions });
function mutation<T>(fn: (input: T) => Promise<unknown>, keys: (input: T) => unknown[][]) {
  const client = useQueryClient();
  return useMutation({ mutationFn: fn, onSuccess: (_, input) => { for (const key of keys(input)) void client.invalidateQueries({ queryKey: key }); } });
}
export const useStartSessionMutation = () => mutation(api.startSession, (id) => [['session', id], ['today']]);
export const usePauseSessionMutation = () => mutation(api.pauseSession, (id) => [['session', id], ['today']]);
export const useResumeSessionMutation = () => mutation(api.resumeSession, (id) => [['session', id], ['today']]);
export const useEndSessionMutation = () => mutation(([id]) => api.endSession(id, true), ([id]) => [['session', id], ['today'], ['history']]);
