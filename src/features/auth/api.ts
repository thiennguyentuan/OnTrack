import { apiRequest, clearSession, saveSession, type ApiSession, type ApiUser } from '../../lib/api-client';
import { toPasswordResetConfirmation, toPasswordResetRequest } from './password-reset';

export type RegisterInput = { fullName: string; email: string; password: string };
export const register = async (input: RegisterInput) => saveSession(await apiRequest<ApiSession>('/api/v3/auth/register', { method: 'POST', body: JSON.stringify({ full_name: input.fullName, email: input.email, password: input.password }) }));
export const login = async (input: { email: string; password: string }) => saveSession(await apiRequest<ApiSession>('/api/v3/auth/login', { method: 'POST', body: JSON.stringify(input) }));
export const logout = async () => { await apiRequest('/api/v3/auth/logout', { method: 'POST' }); await clearSession(); };
export const getCurrentSession = async () => (await import('../../lib/api-client')).hasStoredSession();
export const getProfile = () => apiRequest<ApiUser>('/api/v3/users/me');
export const getSettings = () => apiRequest<ApiUser>('/api/v3/users/me');
export const updateSettings = (input: Partial<Pick<ApiUser, 'full_name' | 'timezone'>>) => apiRequest<ApiUser>('/api/v3/users/me', { method: 'PUT', body: JSON.stringify(input) });
export const requestPasswordReset = (email: string) => apiRequest<{ ok: boolean }>('/api/v3/auth/forgot-password', { method: 'POST', body: JSON.stringify(toPasswordResetRequest(email)) });
export const confirmPasswordReset = (token: string, newPassword: string) => apiRequest<{ ok: boolean }>('/api/v3/auth/reset-password', { method: 'POST', body: JSON.stringify(toPasswordResetConfirmation(token, newPassword)) });
export const changePassword = (currentPassword: string, newPassword: string) => apiRequest<{ ok: boolean }>('/api/v3/auth/change-password', { method: 'POST', body: JSON.stringify({ current_password: currentPassword, new_password: newPassword }) });
