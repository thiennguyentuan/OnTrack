export type DeadlineCardSource = {
  id: string;
  title: string;
  due_at: string;
  progress: number;
  risk_level: string;
  status: string;
  priority: string;
};

export type DeadlineCardPresentation = {
  id: string;
  title: string;
  category: 'ACTIVE' | 'AT_RISK' | 'COMPLETED';
  statusLabel: string;
  statusColor: string;
  statusBg: string;
  borderColor: string;
  daysLeft: number;
  daysLeftLabel: string;
  progress: number;
};

export function toPlanItem(deadline: DeadlineCardSource, now = new Date()): DeadlineCardPresentation {
  // Rounded for display: the API averages child progress, so it arrives as 45.83.
  const progress = Math.round(Math.max(0, Math.min(100, Number(deadline.progress) || 0)));
  const complete = progress === 100 || deadline.status === 'COMPLETED';
  const atRisk = !complete && (deadline.risk_level === 'AT_RISK' || deadline.risk_level === 'OVERDUE' || deadline.status === 'AT_RISK' || deadline.status === 'OVERDUE');
  const category = complete ? 'COMPLETED' : atRisk ? 'AT_RISK' : 'ACTIVE';
  const daysLeft = Math.max(0, Math.ceil((new Date(deadline.due_at).getTime() - now.getTime()) / 86_400_000));
  const palette = complete
    ? { label: 'COMPLETED', color: '#188038', background: '#18803820' }
    : atRisk
      ? { label: deadline.risk_level === 'OVERDUE' || deadline.status === 'OVERDUE' ? 'OVERDUE' : 'AT RISK', color: '#BA1A1A', background: '#BA1A1A20' }
      : { label: 'ACTIVE', color: '#006A6A', background: '#006A6A20' };

  return {
    id: deadline.id, title: deadline.title, category, statusLabel: palette.label,
    statusColor: palette.color, statusBg: palette.background, borderColor: palette.color,
    daysLeft, daysLeftLabel: complete ? 'completed' : daysLeft === 1 ? 'day left' : 'days left', progress,
  };
}
