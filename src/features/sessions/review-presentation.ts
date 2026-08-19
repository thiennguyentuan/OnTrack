export const REVIEW_PROGRESS_OPTIONS = [40, 50, 60, 70, 80, 90, 100];

export function clampReviewProgress(value: number, previous = 0) {
  return Math.min(100, Math.max(previous, Math.round(value)));
}

/** Steps the user may pick. The API rejects progress lower than what the task already has. */
export function reviewProgressChoices(previous = 0) {
  const choices = REVIEW_PROGRESS_OPTIONS.filter((value) => value >= previous);
  return choices.length ? choices : [100];
}

/** Pre-selected step: the first one that does not move the task backwards. */
export function defaultReviewProgress(previous = 0) {
  return reviewProgressChoices(previous)[0];
}
