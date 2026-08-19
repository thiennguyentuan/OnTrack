export function getRegistrationErrorMessage(error: unknown): string {
  if (typeof error === 'object' && error !== null && 'message' in error) {
    const message = (error as { message?: unknown }).message;
    if (typeof message === 'string' && message.trim()) return message;
  }

  if (error instanceof Error && error.message.trim()) return error.message;
  return 'Unable to register';
}
