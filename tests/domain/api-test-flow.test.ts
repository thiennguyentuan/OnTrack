import { describe, expect, it } from 'vitest';
import { getNextApiTestStep } from '../../src/features/api-test/flow';

describe('getNextApiTestStep', () => {
  it('starts at auth and advances through the UX flow', () => {
    expect(getNextApiTestStep({})).toBe('auth');
    expect(getNextApiTestStep({ userId: 'u' })).toBe('plan');
    expect(getNextApiTestStep({ userId: 'u', taskId: 't' })).toBe('session');
    expect(getNextApiTestStep({ userId: 'u', taskId: 't', sessionId: 's' })).toBe('focus');
    expect(getNextApiTestStep({ userId: 'u', taskId: 't', sessionId: 's', focusEnded: true })).toBe('review');
  });
});
