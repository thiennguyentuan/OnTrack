import { describe, expect, it } from 'vitest';
import { logoutAndClear } from '../../src/features/auth/logout';

describe('logoutAndClear', () => {
  it('clears the in-memory session after the API logout succeeds', async () => {
    const calls: string[] = [];
    await logoutAndClear({
      logout: async () => { calls.push('api'); },
      clearSession: () => { calls.push('store'); },
    });
    expect(calls).toEqual(['api', 'store']);
  });
});
