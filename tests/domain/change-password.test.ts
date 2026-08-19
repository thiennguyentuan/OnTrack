import { describe, expect, it } from 'vitest';
import { passwordStrength, STRENGTH_LABELS, validateChangePassword } from '../../src/features/auth/change-password';

const draft = (over: Partial<Parameters<typeof validateChangePassword>[0]> = {}) => ({
  currentPassword: 'old-password',
  newPassword: 'brand-new-password',
  confirmation: 'brand-new-password',
  ...over,
});

describe('change password', () => {
  it('accepts a well-formed change', () => {
    expect(validateChangePassword(draft())).toBeNull();
  });

  it('refuses an empty current password', () => {
    expect(validateChangePassword(draft({ currentPassword: '' }))).toMatch(/current password/i);
  });

  it('enforces the same minimum the API enforces', () => {
    expect(validateChangePassword(draft({ newPassword: 'short', confirmation: 'short' }))).toMatch(/8 characters/);
  });

  it('refuses reusing the current password', () => {
    expect(validateChangePassword(draft({ newPassword: 'old-password', confirmation: 'old-password' }))).toMatch(/different/i);
  });

  it('catches a mistyped confirmation', () => {
    expect(validateChangePassword(draft({ confirmation: 'something-else' }))).toMatch(/do not match/i);
  });

  it('scores password strength across the label range', () => {
    expect(passwordStrength('')).toBe(0);
    expect(passwordStrength('abcdefgh')).toBe(1);
    expect(passwordStrength('abcdefghijkl')).toBe(2);
    expect(passwordStrength('Abcdefghijkl')).toBe(3);
    expect(passwordStrength('Abcdefghijk1!')).toBe(4);
    expect(STRENGTH_LABELS).toHaveLength(5);
  });
});
