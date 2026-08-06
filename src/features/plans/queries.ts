import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import * as api from './api';

export const useDeadlinesQuery = () => useQuery({ queryKey: ['deadlines'], queryFn: api.listDeadlines });
export const useDeadlineQuery = (id: string) => useQuery({ queryKey: ['deadline', id], queryFn: () => api.getDeadline(id), enabled: Boolean(id) });
export const useTaskQuery = (id: string) => useQuery({ queryKey: ['task', id], queryFn: () => api.getTask(id), enabled: Boolean(id) });

function useApiMutation<TInput, TResult>(
  mutationFn: (input: TInput) => Promise<TResult>,
  getKeys: (input: TInput, result: TResult) => unknown[][],
) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn,
    onSuccess: (result, input) => {
      for (const queryKey of getKeys(input, result)) void queryClient.invalidateQueries({ queryKey });
    },
  });
}

export const useCreateDeadlineMutation = () => useApiMutation(api.createDeadline, () => [['deadlines'], ['today']]);
export const useCreateMilestoneMutation = () => useApiMutation(api.createMilestone, (input) => [['deadline', input.deadline_id], ['deadlines'], ['today']]);
export const useCreateTaskMutation = () => useApiMutation(api.createTask, () => [['deadline'], ['deadlines'], ['today']]);
