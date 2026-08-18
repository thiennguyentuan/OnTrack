import AsyncStorage from '@react-native-async-storage/async-storage';
import { normalizeApiError } from './api-error';

export type ApiUser = { id: string; email: string; full_name: string; timezone: string };
export type ApiSession = { token: string; user: ApiUser };
export type StoredSession = { access_token: string; user: ApiUser };
const TOKEN_KEY = 'ontrack_access_token';
const BASE_URL = process.env.EXPO_PUBLIC_API_URL ?? 'http://localhost:8000';
let unauthorizedHandler: (() => void) | null = null;

export function setUnauthorizedHandler(handler: (() => void) | null) {
  unauthorizedHandler = handler;
}

export async function apiRequest<T>(path: string, init: RequestInit = {}, retryWithFreshToken = true): Promise<T> {
  const token = await AsyncStorage.getItem(TOKEN_KEY);
  const response = await fetch(`${BASE_URL}${path}`, {
    ...init,
    headers: { 'Content-Type': 'application/json', ...(token ? { Authorization: `Bearer ${token}` } : {}), ...init.headers },
  });
  const body = await response.json().catch(() => null);
  if (!response.ok) {
    if (response.status === 401) {
      const currentToken = await AsyncStorage.getItem(TOKEN_KEY);
      if (retryWithFreshToken && currentToken && currentToken !== token) {
        return apiRequest<T>(path, init, false);
      }
      await clearSession();
      unauthorizedHandler?.();
    }
    throw normalizeApiError({ code: String(response.status), message: body?.detail ?? 'Request failed' });
  }
  return body as T;
}

export async function saveSession(session: ApiSession): Promise<StoredSession> {
  await AsyncStorage.setItem(TOKEN_KEY, session.token);
  return { access_token: session.token, user: session.user };
}
export async function clearSession() { await AsyncStorage.removeItem(TOKEN_KEY); }
export async function hasStoredSession() { return Boolean(await AsyncStorage.getItem(TOKEN_KEY)); }
