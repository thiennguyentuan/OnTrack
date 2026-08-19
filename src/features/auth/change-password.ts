export type ChangePasswordDraft = {
  currentPassword: string;
  newPassword: string;
  confirmation: string;
};

/**
 * Validates the form before it reaches the API, so the user sees one clear
 * message instead of a round-trip error. Returns null when the draft is valid.
 */
export function validateChangePassword(draft: ChangePasswordDraft): string | null {
  if (!draft.currentPassword) return 'Enter your current password.';
  if (draft.newPassword.length < 8) return 'The new password needs at least 8 characters.';
  if (draft.newPassword === draft.currentPassword) return 'The new password must be different from your current one.';
  if (draft.newPassword !== draft.confirmation) return 'The two new passwords do not match.';
  return null;
}

/** 0..4 — drives the strength meter on the change-password screen. */
export function passwordStrength(password: string) {
  if (!password) return 0;
  let score = 0;
  if (password.length >= 8) score += 1;
  if (password.length >= 12) score += 1;
  if (/[A-Z]/.test(password) && /[a-z]/.test(password)) score += 1;
  if (/\d/.test(password) && /[^A-Za-z0-9]/.test(password)) score += 1;
  return score;
}

export const STRENGTH_LABELS = ['Too short', 'Weak', 'Fair', 'Good', 'Strong'] as const;
