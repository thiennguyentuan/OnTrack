import { toPlanItem, type DeadlineCardPresentation, type DeadlineCardSource } from './presentation';

export async function loadPlanItems(fetchDeadlines: () => Promise<DeadlineCardSource[]>): Promise<DeadlineCardPresentation[]> {
  return (await fetchDeadlines()).map((deadline) => toPlanItem(deadline));
}
