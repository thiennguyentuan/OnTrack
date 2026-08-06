import { supabase } from '../../lib/supabase';
import { normalizeApiError } from '../../lib/api-error';
import type { Database } from '../../types/database';

async function unwrap<T>(promise: PromiseLike<{ data: T; error: { code?: string; message?: string } | null }>): Promise<T> {
  const { data, error } = await promise;
  if (error) throw normalizeApiError(error);
  return data as T;
}

export type RegisterInput = { fullName: string; email: string; password: string };
export const register = async ({ fullName, email, password }: RegisterInput) => {
  const { data, error } = await supabase.auth.signUp({ email, password, options: { data: { full_name: fullName } } });
  if (error) throw normalizeApiError(error);
  return data;
};
export const login = async (input: { email: string; password: string }) => {
  const { data, error } = await supabase.auth.signInWithPassword(input);
  if (error) throw normalizeApiError(error);
  return data;
};
export const logout = () => unwrap(supabase.auth.signOut().then(({ error }) => ({ data: null, error })));
export const getCurrentSession = async () => {
  const { data, error } = await supabase.auth.getSession();
  if (error) throw normalizeApiError(error);
  return data.session;
};
export const getProfile = () => unwrap(supabase.from('profiles').select('*').single());
export const getSettings = () => unwrap(supabase.from('user_settings').select('*').single());
export const updateSettings = (input: Database['public']['Tables']['user_settings']['Update']) => unwrap(supabase.from('user_settings').update(input).select().single());
