import type { DeadlineInput, Priority } from './api';

export type DeadlineFormPayload = {
  title: string;
  dueDateInput: string;
  description: string;
  priority: Priority;
};

export function toDeadlinePayload(input: DeadlineFormPayload): DeadlineInput {
  const [day, month, year] = input.dueDateInput.split('/').map(Number);
  const dueAt = new Date(Date.UTC(year, month - 1, day, 23, 59, 59));
  if (!Number.isFinite(dueAt.getTime())) throw new Error('Invalid due date');
  return {
    title: input.title.trim(),
    description: input.description.trim() || null,
    due_at: dueAt.toISOString(),
    priority: input.priority,
  };
}
