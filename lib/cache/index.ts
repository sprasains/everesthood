import Redis from 'ioredis';

// Create Redis client with connection error handling for build time
const createRedisClient = () => {
  if (process.env.NODE_ENV === 'production' && !process.env.REDIS_URL) {
    // Return a mock client for production builds without Redis
    return {
      get: () => Promise.resolve(null),
      set: () => Promise.resolve('OK'),
      keys: () => Promise.resolve([]),
      info: () => Promise.resolve(''),
      on: () => {},
      disconnect: () => Promise.resolve(),
    } as any;
  }
  
  const client = new Redis(process.env.REDIS_URL || 'redis://localhost:6379', {
    retryDelayOnFailover: 100,
    maxRetriesPerRequest: 1,
    lazyConnect: true,
  });
  
  client.on('error', (err) => {
    if (process.env.NODE_ENV === 'production') {
      console.warn('[Redis] Connection error (non-fatal):', err.message);
    }
  });
  
  return client;
};

export const redis = createRedisClient();

export async function cacheGet(key: string): Promise<string | null> {
  return redis.get(key);
}

export async function cacheSet(
  key: string,
  value: string,
  ttlSeconds?: number
): Promise<'OK' | null> {
  if (ttlSeconds) {
    return redis.set(key, value, 'EX', ttlSeconds);
  }
  return redis.set(key, value);
}

export async function cacheGetJson<T = any>(key: string): Promise<T | null> {
  const val = await cacheGet(key);
  if (!val) return null;
  try {
    return JSON.parse(val);
  } catch {
    return null;
  }
}

export async function cacheSetJson(
  key: string,
  value: any,
  ttlSeconds?: number
): Promise<'OK' | null> {
  return cacheSet(key, JSON.stringify(value), ttlSeconds);
}

export async function cacheKeys(pattern = '*'): Promise<string[]> {
  return redis.keys(pattern);
}
