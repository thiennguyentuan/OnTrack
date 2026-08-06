export type ApiError = {
  code: string;
  message: string;
  field?: string;
};

export function normalizeApiError(
  error: { code?: string; message?: string; details?: string } | null,
): ApiError {
  const code = error?.code ?? 'UNKNOWN';
  const message = error?.message ?? 'Something went wrong';
  const field = error?.details?.match(/column "([^"]+)"/)?.[1];

  return { code, message, field };
}
