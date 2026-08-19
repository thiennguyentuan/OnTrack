/**
 * Helpers for the integration suite. These talk to the real FastAPI backend, so
 * they skip cleanly when it is not running instead of failing the whole suite.
 *
 * Point them elsewhere with ONTRACK_API_URL.
 */
export const API = process.env.ONTRACK_API_URL ?? 'http://127.0.0.1:8001';

export async function apiIsReachable() {
  try {
    const response = await fetch(`${API}/health`, { signal: AbortSignal.timeout(3000) });
    return response.ok;
  } catch {
    return false;
  }
}

export type ApiResult<T = any> = { status: number; body: T };

export async function call<T = any>(
  path: string,
  options: { method?: string; token?: string; body?: unknown } = {},
): Promise<ApiResult<T>> {
  const response = await fetch(`${API}${path}`, {
    method: options.method ?? (options.body === undefined ? 'GET' : 'POST'),
    headers: {
      'Content-Type': 'application/json',
      ...(options.token ? { Authorization: `Bearer ${options.token}` } : {}),
    },
    body: options.body === undefined ? undefined : JSON.stringify(options.body),
  });
  const body = await response.json().catch(() => null);
  return { status: response.status, body: body as T };
}

/** Fails loudly with the API's own message so a broken test is easy to read. */
export async function ok<T = any>(path: string, options?: Parameters<typeof call>[1]): Promise<T> {
  const result = await call<T>(path, options);
  if (result.status >= 400) {
    throw new Error(`${options?.method ?? 'GET'} ${path} -> ${result.status}: ${JSON.stringify(result.body)}`);
  }
  return result.body;
}

// Test files run in separate workers, each with its own module scope, so a
// per-module counter alone collides across files. The UUID makes it unique.
export const uniqueEmail = () => `it-${crypto.randomUUID()}@ontrack.test`;

export async function registerUser(password = 'integration-pass-1') {
  const email = uniqueEmail();
  const created = await ok('/api/v3/auth/register', {
    body: { email, password, full_name: 'Integration User' },
  });
  return { email, password, token: created.token as string, user: created.user };
}

export const inDays = (days: number) =>
  new Date(Date.now() + days * 86_400_000).toISOString();

/** Builds deadline -> milestone -> task in one call, the shape every flow needs. */
export async function seedHierarchy(token: string, over: { dueInDays?: number; title?: string } = {}) {
  const deadline = await ok('/api/v3/deadlines', {
    token,
    body: { title: over.title ?? 'Integration Deadline', due_at: inDays(over.dueInDays ?? 20), priority: 'HIGH' },
  });
  const milestone = await ok('/api/v3/milestones', {
    token,
    body: { deadline_id: deadline.id, title: 'Implementation', target_at: inDays(10) },
  });
  const task = await ok('/api/v3/tasks', {
    token,
    body: { milestone_id: milestone.id, title: 'UI Design', priority: 'HIGH' },
  });
  return { deadline, milestone, task };
}

export async function planSession(token: string, taskId: string, minutes = 45) {
  return ok('/api/v3/sessions', {
    token,
    body: { task_id: taskId, planned_start_at: new Date().toISOString(), estimated_minutes: minutes, focus_mode: 'HIGH' },
  });
}
