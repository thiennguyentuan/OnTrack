import { describe, expect, it } from 'vitest';
import { formatFocusTimer } from '../../src/features/sessions/focus-presentation';

describe('formatFocusTimer', () => {
  it('renders a zero-padded minute timer', () => {
    expect(formatFocusTimer(125)).toBe('02:05');
  });
});
