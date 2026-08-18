import { apiRequest, clearSession, saveSession, type ApiSession } from '../../lib/api-client';

export type RegisterInput = { fullName: string; email: string; password: string };
export const register = async (input: RegisterInput) => saveSession(await apiRequest<ApiSession>('/api/v3/auth/register', { method: 'POST', body: JSON.stringify({ full_name: input.fullName, email: input.email, password: input.password }) }));
export const login = async (input: { email: string; password: string }) => saveSession(await apiRequest<ApiSession>('/api/v3/auth/login', { method: 'POST', body: JSON.stringify(input) }));
export const logout = async () => { await apiRequest('/api/v3/auth/logout', { method: 'POST' }); await clearSession(); };
export const getCurrentSession = async () => (await import('../../lib/api-client')).hasStoredSession();
export const getProfile = () => apiRequest('/api/v3/users/me');
export const getSettings = () => apiRequest('/api/v3/users/me');
export const updateSettings = (input: Record<string, unknown>) => apiRequest('/api/v3/users/me', { method: 'PUT', body: JSON.stringify(input) });
