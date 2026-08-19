import { describe, expect, it } from 'vitest';
import { toPasswordResetRequest, toPasswordResetConfirmation } from '../../src/features/auth/password-reset';

describe('toPasswordResetRequest', () => {
  it('normalizes the email before the reset API request', () => {
    expect(toPasswordResetRequest('  Student@OnTrack.Test ')).toEqual({ email: 'student@ontrack.test' });
  });

  it('keeps the reset token and new password in the confirmation payload', () => {
    expect(toPasswordResetConfirmation('reset-token', 'NewPassw0rd!')).toEqual({ token: 'reset-token', new_password: 'NewPassw0rd!' });
  });
});
