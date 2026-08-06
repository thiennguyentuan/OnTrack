import { normalizeApiError } from '../../lib/api-error';
import { supabase } from '../../lib/supabase';

type QueryResult<T> = PromiseLike<{
  data: T | null;
  error: { code?: string; message?: string } | null;
}>;

async function unwrap<T>(promise: QueryResult<T>): Promise<T> {
  const { data, error } = await promise;

  if (error) {
    throw normalizeApiError(error);
  }

  return data as T;
}

async function unwrapVoid(
  promise: PromiseLike<{ error: { code?: string; message?: string } | null }>,
): Promise<void> {
  const { error } = await promise;

  if (error) {
    throw normalizeApiError(error);
  }
}

export type Priority = 'LOW' | 'MEDIUM' | 'HIGH';
export type DeadlineStatus = 'PLANNING' | 'IN_PROGRESS' | 'AT_RISK' | 'COMPLETED' | 'OVERDUE';
export type MilestoneStatus = 'NOT_STARTED' | 'IN_PROGRESS' | 'COMPLETED' | 'OVERDUE';
export type TaskStatus = 'NOT_STARTED' | 'IN_PROGRESS' | 'COMPLETED' | 'CANCELLED';

export type DeadlineInput = {
  title: string;
  description?: string | null;
  due_at: string;
  priority: Priority;
};

export type MilestoneInput = {
  deadline_id: string;
  title: string;
  description?: string | null;
  target_at: string;
  position?: number;
};

export type TaskInput = {
  milestone_id: string;
  title: string;
  description?: string | null;
  priority: Priority;
  position?: number;
};

export const listDeadlines = () =>
  unwrap(
    supabase
      .from('deadlines')
      .select('id,title,due_at,priority,status,progress,risk_level')
      .order('due_at', { ascending: true }),
  );

export const getDeadline = (id: string) =>
  unwrap(
    supabase
      .from('deadlines')
      .select(
        `
          *,
          milestones (
            *,
            tasks (
              id,
              milestone_id,
              title,
              description,
              priority,
              status,
              current_progress,
              position,
              created_at,
              updated_at
            )
          )
        `,
      )
      .eq('id', id)
      .single(),
  );

export const getTask = (id: string) =>
  unwrap(
    supabase
      .from('tasks')
      .select(
        `
          *,
          milestones!inner (
            id,
            title,
            deadline_id
          )
        `,
      )
      .eq('id', id)
      .single(),
  );

export const createDeadline = (input: DeadlineInput) =>
  unwrap(supabase.from('deadlines').insert(input).select().single());

export const updateDeadline = (id: string, input: Partial<DeadlineInput>) =>
  unwrap(supabase.from('deadlines').update(input).eq('id', id).select().single());

export const deleteDeadline = async (id: string) => {
  await unwrapVoid(supabase.from('deadlines').delete().eq('id', id));
};

export const createMilestone = (input: MilestoneInput) =>
  unwrap(supabase.from('milestones').insert(input).select().single());

export const updateMilestone = (id: string, input: Partial<MilestoneInput>) =>
  unwrap(supabase.from('milestones').update(input).eq('id', id).select().single());

export const deleteMilestone = async (id: string) => {
  await unwrapVoid(supabase.from('milestones').delete().eq('id', id));
};

export const createTask = (input: TaskInput) =>
  unwrap(supabase.from('tasks').insert(input).select().single());

export const updateTask = (id: string, input: Partial<TaskInput>) =>
  unwrap(supabase.from('tasks').update(input).eq('id', id).select().single());

export const deleteTask = async (id: string) => {
  await unwrapVoid(supabase.from('tasks').delete().eq('id', id));
};
