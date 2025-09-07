import { NextRequest, NextResponse } from 'next/server';
import { getLogger } from '@/lib/logger';
import { captureException } from '@sentry/nextjs';
import { env } from '@/env.mjs';
import { ZodError } from 'zod';
import { TRPCError } from '@trpc/server';
import { Prisma } from '@prisma/client';

const logger = getLogger('error-handler');

interface ErrorResponse {
  message: string;
  code: string;
  statusCode: number;
  details?: unknown;
}

export async function handleError(
  error: unknown,
  req: NextRequest
): Promise<NextResponse> {
  let errorResponse: ErrorResponse;

  // Handle known errors
  if (error instanceof ZodError) {
    errorResponse = {
      message: 'Validation error',
      code: 'VALIDATION_ERROR',
      statusCode: 400,
      details: error.issues,
    };
  } else if (error instanceof TRPCError) {
    errorResponse = {
      message: error.message,
      code: error.code,
      statusCode: getHttpStatus(error.code),
    };
  } else if (error instanceof Prisma.PrismaClientKnownRequestError) {
    errorResponse = handlePrismaError(error);
  } else if (error instanceof Error) {
    errorResponse = {
      message:
        env.NODE_ENV === 'development'
          ? error.message
          : 'Internal server error',
      code: 'INTERNAL_SERVER_ERROR',
      statusCode: 500,
    };
  } else {
    errorResponse = {
      message: 'Internal server error',
      code: 'INTERNAL_SERVER_ERROR',
      statusCode: 500,
    };
  }

  // Log error
  logger.error({
    error: error instanceof Error ? error : new Error(String(error)),
    url: req.url,
    method: req.method,
    headers: Object.fromEntries(req.headers),
    ...errorResponse,
  });

  // Report to Sentry if it's an unexpected error
  if (errorResponse.statusCode >= 500) {
    captureException(error, {
      extra: {
        url: req.url,
        method: req.method,
      },
    });
  }

  return NextResponse.json(
    { error: errorResponse },
    { status: errorResponse.statusCode }
  );
}

function handlePrismaError(
  error: Prisma.PrismaClientKnownRequestError
): ErrorResponse {
  switch (error.code) {
    case 'P2002':
      return {
        message: 'A unique constraint would be violated.',
        code: 'CONFLICT',
        statusCode: 409,
        details: {
          fields: error.meta?.target as string[],
        },
      };
    case 'P2025':
      return {
        message: 'Record not found.',
        code: 'NOT_FOUND',
        statusCode: 404,
      };
    default:
      return {
        message: 'Database error',
        code: 'DATABASE_ERROR',
        statusCode: 500,
      };
  }
}

function getHttpStatus(tRPCErrorCode: string): number {
  switch (tRPCErrorCode) {
    case 'BAD_REQUEST':
      return 400;
    case 'UNAUTHORIZED':
      return 401;
    case 'FORBIDDEN':
      return 403;
    case 'NOT_FOUND':
      return 404;
    case 'TIMEOUT':
      return 408;
    case 'CONFLICT':
      return 409;
    case 'PRECONDITION_FAILED':
      return 412;
    case 'PAYLOAD_TOO_LARGE':
      return 413;
    case 'METHOD_NOT_SUPPORTED':
      return 405;
    case 'TOO_MANY_REQUESTS':
      return 429;
    default:
      return 500;
  }
}
