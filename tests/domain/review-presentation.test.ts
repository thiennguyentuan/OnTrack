import { describe, expect, it } from 'vitest';
import {
  clampReviewProgress,
  defaultReviewProgress,
  REVIEW_PROGRESS_OPTIONS,
  reviewProgressChoices,
} from '../../src/features/sessions/review-presentation';

describe('review presentation', () => {
  it('keeps progress from moving backwards or outside 0..100', () => {
    expect(clampReviewProgress(20, 40)).toBe(40);
    expect(clampReviewProgress(140, 40)).toBe(100);
  });
  it('provides the wireframe progress choices up to completion', () => {
    expect(REVIEW_PROGRESS_OPTIONS).toEqual([40, 50, 60, 70, 80, 90, 100]);
  });
  it('hides steps that would move the task backwards', () => {
    expect(reviewProgressChoices(0)).toEqual([40, 50, 60, 70, 80, 90, 100]);
    expect(reviewProgressChoices(80)).toEqual([80, 90, 100]);
    expect(reviewProgressChoices(100)).toEqual([100]);
  });
  it('defaults to the first step that does not regress', () => {
    expect(defaultReviewProgress(0)).toBe(40);
    expect(defaultReviewProgress(85)).toBe(90);
    expect(defaultReviewProgress(100)).toBe(100);
  });
});
