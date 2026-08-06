import { describe, expect, it } from 'vitest';
import { normalizeApiError } from '../../src/lib/api-error';

describe('normalizeApiError', () => {
  it('returns a stable message and code for a Postgrest error', () => {
    expect(normalizeApiError({ code: '23505', message: 'duplicate key value' })).toEqual({
      code: '23505',
      message: 'duplicate key value',
      field: undefined,
    });
  });
});
