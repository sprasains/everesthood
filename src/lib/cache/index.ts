import Redis from 'ioredis';

const redis = new Redis(process.env.REDIS_URL || 'redis://localhost:6379');

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

export async function cacheDel(key: string): Promise<number> {
  return redis.del(key);
}

export default redis;
