export type LegacyRoute = 'deadline' | 'task' | 'session' | 'sessionFocus' | 'sessionReview' | 'sessionPlan';

export function legacyDestination(route: LegacyRoute, id?: string) {
  if (!id) return '/(tabs)/plans';
  switch (route) {
    case 'deadline': return `/deadline/${id}`;
    case 'task': return `/task/${id}`;
    case 'session': return `/session/${id}`;
    case 'sessionFocus': return `/session/${id}/focus`;
    case 'sessionReview': return `/session/${id}/review`;
    case 'sessionPlan': return `/session/plan?taskId=${encodeURIComponent(id)}`;
  }
}
