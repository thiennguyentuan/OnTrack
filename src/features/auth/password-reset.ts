export function toPasswordResetRequest(email: string) {
  return { email: email.trim().toLowerCase() };
}

export function toPasswordResetConfirmation(token: string, newPassword: string) {
  return { token, new_password: newPassword };
}
