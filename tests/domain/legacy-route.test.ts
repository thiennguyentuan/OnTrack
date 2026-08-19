import { describe, expect, it } from 'vitest';
import { legacyDestination } from '../../src/features/navigation/legacy-route';

describe('legacyDestination', () => {
  it('keeps legacy deep links on their API-backed resource route', () => {
    expect(legacyDestination('deadline', 'd-1')).toBe('/deadline/d-1');
    expect(legacyDestination('task', 't-1')).toBe('/task/t-1');
    expect(legacyDestination('sessionFocus', 's-1')).toBe('/session/s-1/focus');
  });

  it('sends legacy routes without a resource id to the real Plans entry point', () => {
    expect(legacyDestination('task')).toBe('/(tabs)/plans');
  });
});
