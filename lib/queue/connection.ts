import Redis from 'ioredis';

let redisInstance: Redis | null = null;

export function getRedis() {
  if (redisInstance) return redisInstance;
  const opts: any = {};
  const REDIS_URL = process.env.REDIS_URL || 'redis://localhost:6379';
  const REDIS_TLS = process.env.REDIS_TLS;
  const REDIS_PREFIX = process.env.REDIS_PREFIX;
  if ((REDIS_URL || '').startsWith('rediss://') || REDIS_TLS === 'true') {
    opts.tls = {};
  }
  if (REDIS_PREFIX) opts.keyPrefix = REDIS_PREFIX;
  redisInstance = new Redis(REDIS_URL, opts);
  redisInstance.on('error', (err: Error) =>
    console.error('[Redis] Error:', err)
  );
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
