const query = (key: string, value: string) => `${encodeURIComponent(key)}=${encodeURIComponent(value)}`;

export const flowRoutes = {
  milestoneDetail: (id: string) => `/milestone/${id}`,
  milestoneEdit: (id: string, deadlineId?: string) => `/milestone/edit-milestone?${query('milestoneId', id)}${deadlineId ? `&${query('deadlineId', deadlineId)}` : ''}`,
  taskCreate: (milestoneId: string) => `/task/create-task?${query('milestoneId', milestoneId)}`,
  taskEdit: (id: string) => `/task/edit-task?${query('taskId', id)}`,
  progress: () => '/(tabs)/progress',
  risk: (deadlineId: string) => `/risk/${deadlineId}`,
};
