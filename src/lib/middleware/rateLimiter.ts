import { type NextApiRequest, type NextApiResponse } from 'next';
import { redis } from '@/lib/redis';
import { ApiError } from '@/lib/api/handler';

const NODE_ENV = process.env.NODE_ENV;

interface RateLimitConfig {
  windowMs: number;
  max: number;
  keyGenerator?: (req: NextApiRequest) => string;
}

const defaultConfig: RateLimitConfig = {
  windowMs: 60 * 1000, // 1 minute
  max: 60, // 60 requests per minute
  keyGenerator: (req) => {
    const ip =
      req.headers['x-forwarded-for'] ||
      req.connection.remoteAddress ||
      'unknown';
    return `rate-limit:${ip}:${req.url}`;
  },
};

export function rateLimiter(config: Partial<RateLimitConfig> = {}) {
  const { windowMs, max, keyGenerator } = { ...defaultConfig, ...config };

  return async function rateLimit(
    req: NextApiRequest,
    res: NextApiResponse,
    next: () => void
  ) {
    // Skip rate limiting in development
    if (NODE_ENV === 'development') {
      return next();
    }

    const key = keyGenerator!(req);

    try {
      // Get current count
      const current = await redis.get<number>(key);
      const newCount = (current || 0) + 1;

      if (current !== null) {
        // Key exists, increment
        if (newCount > max) {
          throw new ApiError(429, 'Too Many Requests');
        }
        await redis.set(key, newCount);
      } else {
        // Key doesn't exist, create it with expiry
        await redis.set(key, 1, Math.floor(windowMs / 1000));
      }

      // Set rate limit headers
      res.setHeader('X-RateLimit-Limit', max);
      res.setHeader('X-RateLimit-Remaining', Math.max(0, max - newCount));
      res.setHeader('X-RateLimit-Reset', Date.now() + windowMs);

      next();
    } catch (error) {
      if (error instanceof ApiError && error.statusCode === 429) {
        res.status(429).json({
          error: {
            message: 'Too Many Requests',
            code: 'RATE_LIMIT_EXCEEDED',
          },
        });
        return;
      }
      next();
    }
  };
}

// Route-specific rate limiters
export const apiLimiter = rateLimiter();

export const authLimiter = rateLimiter({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // 5 requests per 15 minutes
});

export const searchLimiter = rateLimiter({
  windowMs: 60 * 1000, // 1 minute
  max: 30, // 30 searches per minute
});
