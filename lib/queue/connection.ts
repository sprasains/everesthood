import Redis from 'ioredis';

let redisInstance: Redis | null = null;

export function getRedis() {
  if (redisInstance) return redisInstance;
  
  // Skip Redis connection during build time or when Redis is not available
  if (process.env.NODE_ENV === 'production' && !process.env.REDIS_URL) {
    // Return a mock client for production builds without Redis
    return {
      ping: () => Promise.resolve('PONG'),
      get: () => Promise.resolve(null),
      set: () => Promise.resolve('OK'),
      keys: () => Promise.resolve([]),
      info: () => Promise.resolve(''),
      on: () => {},
      quit: () => Promise.resolve('OK'),
    } as any;
  }
  
  const opts: any = {};
  const REDIS_URL = process.env.REDIS_URL || 'redis://localhost:6379';
  const REDIS_TLS = process.env.REDIS_TLS;
  const REDIS_PREFIX = process.env.REDIS_PREFIX;
  if ((REDIS_URL || '').startsWith('rediss://') || REDIS_TLS === 'true') {
    opts.tls = {};
  }
  if (REDIS_PREFIX) opts.keyPrefix = REDIS_PREFIX;
  
  redisInstance = new Redis(REDIS_URL, {
    ...opts,
    retryDelayOnFailover: 100,
    maxRetriesPerRequest: 1,
    lazyConnect: true,
  });
  
  redisInstance.on('error', (err: Error) => {
    if (process.env.NODE_ENV === 'production') {
      console.warn('[Redis] Connection error (build mode):', err.message);
    } else {
      console.error('[Redis] Error:', err);
    }
  });
  redisInstance.on('connect', () => console.info('[Redis] connected'));
  return redisInstance;
}

export function getRedisConnection() {
  return getRedis();
}

export async function closeRedis() {
  if (!redisInstance) return;
  try {
    await redisInstance.quit();
  } catch (err) {
    // ignore
  }
  redisInstance = null;
}
