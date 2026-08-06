import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import * as api from './api';

export const useTodayDashboardQuery = () => useQuery({ queryKey: ['today'], queryFn: () => api.getTodayDashboard() });
export const useSessionHistoryQuery = () => useQuery({ queryKey: ['history'], queryFn: api.getSessionHistory });
export const useDeadlineRiskQuery = (id: string) => useQuery({ queryKey: ['risk', id], queryFn: () => api.getDeadlineRisk(id), enabled: Boolean(id) });
export const useCompleteSessionReviewMutation = () => {
  const client = useQueryClient();
  return useMutation({ mutationFn: api.completeSessionReview, onSuccess: () => { for (const key of [['today'], ['history'], ['deadlines'], ['risk']]) void client.invalidateQueries({ queryKey: key }); } });
};
export const useCreateFollowUpSessionMutation = () => {
  const client = useQueryClient();
  return useMutation({ mutationFn: api.createFollowUpSession, onSuccess: () => { for (const key of [['today'], ['history'], ['task'], ['session']]) void client.invalidateQueries({ queryKey: key }); } });
};
