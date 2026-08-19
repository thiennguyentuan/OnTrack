import { describe, expect, it } from 'vitest';
import { toProfileUpdate } from '../../src/features/settings/account';

describe('toProfileUpdate', () => {
  it('serializes only supported profile fields for the REST endpoint', () => {
    expect(toProfileUpdate({ fullName: '  Minh Tran  ', timezone: ' Asia/Ho_Chi_Minh ' })).toEqual({
      full_name: 'Minh Tran', timezone: 'Asia/Ho_Chi_Minh',
    });
  });
});
