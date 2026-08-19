import { describe, expect, it } from 'vitest';
import { getRegistrationErrorMessage } from '../../src/features/auth/register-error';

describe('getRegistrationErrorMessage', () => {
  it('keeps the API message for duplicate registration errors', () => {
    expect(getRegistrationErrorMessage({ code: '409', message: 'Email already exists' })).toBe('Email already exists');
  });

  it('falls back for unknown registration errors', () => {
    expect(getRegistrationErrorMessage(null)).toBe('Unable to register');
  });
});
