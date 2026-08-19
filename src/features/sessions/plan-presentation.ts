export function toPlanSessionView(task: { title?: string | null; current_progress?: number | null }) {
  return { title: task.title ?? 'Selected task', progress: Math.max(0, Math.min(100, Number(task.current_progress ?? 0))) };
}
