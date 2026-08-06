import { supabase } from '../../lib/supabase';
import { normalizeApiError } from '../../lib/api-error';

async function unwrap<T>(promise: PromiseLike<{ data: T | null; error: { code?: string; message?: string } | null }>): Promise<T> {
  const { data, error } = await promise;
  if (error) throw normalizeApiError(error);
  return data as T;
}

export type RegisterInput = { fullName: string; email: string; password: string };
export const register = ({ fullName, email, password }: RegisterInput) =>
  unwrap(supabase.auth.signUp({ email, password, options: { data: { full_name: fullName } } }));
export const login = (input: { email: string; password: string }) => unwrap(supabase.auth.signInWithPassword(input));
export const logout = () => unwrap(supabase.auth.signOut().then(({ error }) => ({ data: null, error })));
export const getCurrentSession = () => unwrap(supabase.auth.getSession()).then((result) => result.session);
export const getProfile = () => unwrap(supabase.from('profiles').select('*').single());
export const getSettings = () => unwrap(supabase.from('user_settings').select('*').single());
export const updateSettings = (input: Record<string, unknown>) => unwrap(supabase.from('user_settings').update(input).select().single());
