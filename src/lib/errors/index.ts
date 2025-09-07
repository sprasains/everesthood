export function showError(message: string, error?: unknown) {
  // Minimal no-op UI helper; integrate toast if available
  if (process.env.NODE_ENV !== 'production') {
    // eslint-disable-next-line no-console
    console.error('[Error]', message, error);
  }
}

export * from './handleError';
import { TRPCError } from '@trpc/server';
import { toast } from 'react-hot-toast';

export class APIError extends Error {
  constructor(
    message: string,
    public code: TRPCError['code'] = 'INTERNAL_SERVER_ERROR',
    public cause?: unknown
  ) {
    super(message);
    this.name = 'APIError';
  }
}

export function handleAPIError(error: unknown): never {
  console.error('API Error:', error);

  if (error instanceof TRPCError) {
    throw new APIError(error.message, error.code, error);
  }

  if (error instanceof Error) {
    throw new APIError(error.message, 'INTERNAL_SERVER_ERROR', error);
  }

  throw new APIError('An unexpected error occurred');
}

export function showError(error: unknown) {
  if (error instanceof APIError) {
    toast.error(error.message);
    return;
  }

  if (error instanceof Error) {
    toast.error(error.message);
    return;
  }

  toast.error('An unexpected error occurred');
}

export function showSuccess(message: string) {
  toast.success(message);
}

export function getErrorMessage(error: unknown): string {
  if (error instanceof APIError) {
    return error.message;
  }

  if (error instanceof Error) {
    return error.message;
  }

  return 'An unexpected error occurred';
}
