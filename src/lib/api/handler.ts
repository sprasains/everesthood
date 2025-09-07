import { type NextApiRequest, type NextApiResponse } from 'next';
import { env } from '@/env.mjs';
import { logger } from '@/lib/logger';

export interface ErrorResponse {
  error: {
    message: string;
    code: string;
    details?: unknown;
  };
}

export function apiHandler(
  handler: (
    req: NextApiRequest,
    res: NextApiResponse
  ) => Promise<void | NextApiResponse>
) {
  return async (req: NextApiRequest, res: NextApiResponse) => {
    try {
      // Add request logging
      logger.info({
        method: req.method,
        url: req.url,
        query: req.query,
      });

      // Add basic security headers
      res.setHeader('X-Content-Type-Options', 'nosniff');
      res.setHeader('X-Frame-Options', 'DENY');
      res.setHeader('X-XSS-Protection', '1; mode=block');

      // Handle preflight requests
      if (req.method === 'OPTIONS') {
        res.setHeader(
          'Access-Control-Allow-Methods',
          'GET, POST, PUT, DELETE, OPTIONS'
        );
        res.setHeader(
          'Access-Control-Allow-Headers',
          'Content-Type, Authorization'
        );
        return res.status(200).end();
      }

      // Execute handler
      await handler(req, res);
    } catch (error) {
      logger.error(error, 'API Error');

      // Don't expose internal errors in production
      const isProduction = env.NODE_ENV === 'production';
      const message = isProduction
        ? 'An unexpected error occurred'
        : error instanceof Error
        ? error.message
        : 'Unknown error';

      const errorResponse: ErrorResponse = {
        error: {
          message,
          code: error instanceof Error ? error.name : 'UNKNOWN_ERROR',
          ...(isProduction ? {} : { details: error }),
        },
      };

      // If headers already sent, we can't send an error response
      if (res.headersSent) {
        logger.error('Headers already sent');
        return;
      }

      const status =
        error instanceof ApiError
          ? error.statusCode
          : error instanceof Error
          ? 500
          : 500;

      res.status(status).json(errorResponse);
    }
  };
}

export class ApiError extends Error {
  constructor(
    public statusCode: number,
    message: string,
    public code = 'API_ERROR'
  ) {
    super(message);
    this.name = 'ApiError';
  }

  static BadRequest(message = 'Bad Request') {
    return new ApiError(400, message, 'BAD_REQUEST');
  }

  static Unauthorized(message = 'Unauthorized') {
    return new ApiError(401, message, 'UNAUTHORIZED');
  }

  static Forbidden(message = 'Forbidden') {
    return new ApiError(403, message, 'FORBIDDEN');
  }

  static NotFound(message = 'Not Found') {
    return new ApiError(404, message, 'NOT_FOUND');
  }

  static MethodNotAllowed(message = 'Method Not Allowed') {
    return new ApiError(405, message, 'METHOD_NOT_ALLOWED');
  }

  static Conflict(message = 'Conflict') {
    return new ApiError(409, message, 'CONFLICT');
  }

  static TooManyRequests(message = 'Too Many Requests') {
    return new ApiError(429, message, 'TOO_MANY_REQUESTS');
  }

  static InternalServer(message = 'Internal Server Error') {
    return new ApiError(500, message, 'INTERNAL_SERVER_ERROR');
  }
}
