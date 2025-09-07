import Redis from 'ioredis';
import { logger } from '@/lib/logger';

// Initialize Redis with retries and error handling
const createRedisClient = () => {
  const client = new Redis(process.env.REDIS_URL || 'redis://localhost:6379', {
    retryStrategy: (times) => {
      const delay = Math.min(times * 50, 2000);
      logger.warn({ times, delay }, 'Redis connection retry');
      return delay;
    },
    maxRetriesPerRequest: 3,
  });

  client.on('error', (error) => {
    logger.error({ error }, 'Redis client error');
  });

  client.on('connect', () => {
    logger.info('Redis client connected');
  });

  return client;
};

export let redis = createRedisClient();

// Allow tests to inject a fake redis client
export const setRedisClient = (client: any) => {
  // replace runtime redis client (useful for tests)
  // eslint-disable-next-line no-param-reassign
  redis = client;
};

// Cache namespace prefix management
const DEFAULT_NAMESPACE = 'app';
let currentNamespace = DEFAULT_NAMESPACE;

export const setNamespace = (namespace: string) => {
  currentNamespace = namespace;
};

export const getNamespacedKey = (key: string) => `${currentNamespace}:${key}`;

// Simple in-process circuit breaker for Redis
let circuitOpen = false;
let circuitOpenedAt = 0;
const CIRCUIT_TIMEOUT_MS = 30_000;

function checkCircuit() {
  if (!circuitOpen) return false;
  if (Date.now() - circuitOpenedAt > CIRCUIT_TIMEOUT_MS) {
    circuitOpen = false;
    logger.warn('Redis circuit closed after timeout');
    return false;
  }
  return true;
}

function tripCircuit(reason?: unknown) {
  circuitOpen = true;
  circuitOpenedAt = Date.now();
  logger.error({ reason }, 'Redis circuit opened');
}

// Legacy cache functions with enhanced error handling and logging
export async function cacheGet(key: string): Promise<string | null> {
  try {
    if (checkCircuit()) return null;
    const namespacedKey = getNamespacedKey(key);
    const value = await redis.get(namespacedKey);
    logger.debug({ key: namespacedKey, hit: !!value }, 'Cache get');
    return value;
  } catch (error) {
    tripCircuit(error);
    logger.error({ key, error }, 'Cache get error');
    return null;
  }
}

export async function cacheSet(
  key: string,
  value: string,
  ttlSeconds?: number
): Promise<'OK' | null> {
  try {
    if (checkCircuit()) return null;
    const namespacedKey = getNamespacedKey(key);
    const result = ttlSeconds
      ? await redis.set(namespacedKey, value, 'EX', ttlSeconds)
      : await redis.set(namespacedKey, value);
    logger.debug({ key: namespacedKey, ttl: ttlSeconds }, 'Cache set');
    return result;
  } catch (error) {
    tripCircuit(error);
    logger.error({ key, error }, 'Cache set error');
    return null;
  }
}

export async function cacheGetJson<T = any>(key: string): Promise<T | null> {
  try {
    const val = await cacheGet(key);
    if (!val) return null;
    return JSON.parse(val);
  } catch (error) {
    logger.error({ key, error }, 'Cache get JSON error');
    return null;
  }
}

export async function cacheSetJson(
  key: string,
  value: any,
  ttlSeconds?: number
): Promise<'OK' | null> {
  try {
    return cacheSet(key, JSON.stringify(value), ttlSeconds);
  } catch (error) {
    logger.error({ key, error }, 'Cache set JSON error');
    return null;
  }
}

export async function cacheKeys(pattern = '*'): Promise<string[]> {
  try {
    if (checkCircuit()) return [];
    const namespacedPattern = getNamespacedKey(pattern);
    const keys = await redis.keys(namespacedPattern);
    logger.debug(
      { pattern: namespacedPattern, count: keys.length },
      'Cache keys'
    );
    return keys;
  } catch (error) {
    tripCircuit(error);
    logger.error({ pattern, error }, 'Cache keys error');
    return [];
  }
}

export async function cacheDel(key: string): Promise<number> {
  try {
    if (checkCircuit()) return 0;
    const namespacedKey = getNamespacedKey(key);
    const result = await redis.del(namespacedKey);
    logger.debug({ key: namespacedKey }, 'Cache delete');
    return result;
  } catch (error) {
    tripCircuit(error);
    logger.error({ key, error }, 'Cache delete error');
    return 0;
  }
}

// Enhanced cache operations
export async function cacheSetWithTags(
  key: string,
  value: any,
  tags: string[],
  ttlSeconds?: number
): Promise<'OK' | null> {
  try {
    if (checkCircuit()) return null;
    const multi = redis.multi();
    const namespacedKey = getNamespacedKey(key);

    // Set the main value
    if (ttlSeconds) {
      multi.set(namespacedKey, JSON.stringify(value), 'EX', ttlSeconds);
    } else {
      multi.set(namespacedKey, JSON.stringify(value));
    }

    // Add key to tag sets
    tags.forEach((tag) => {
      const tagKey = getNamespacedKey(`tag:${tag}`);
      multi.sadd(tagKey, namespacedKey);
      if (ttlSeconds) {
        multi.expire(tagKey, ttlSeconds);
      }
    });

    await multi.exec();
    logger.debug({ key: namespacedKey, tags }, 'Cache set with tags');
    return 'OK';
  } catch (error) {
    tripCircuit(error);
    logger.error({ key, tags, error }, 'Cache set with tags error');
    return null;
  }
}

export async function cacheInvalidateByTag(tag: string): Promise<number> {
  try {
    if (checkCircuit()) return 0;
    const tagKey = getNamespacedKey(`tag:${tag}`);
    const keys = await redis.smembers(tagKey);

    if (keys.length > 0) {
      const multi = redis.multi();
      multi.del(...keys);
      multi.del(tagKey);
      await multi.exec();
    }

    logger.debug({ tag, count: keys.length }, 'Cache invalidate by tag');
    return keys.length;
  } catch (error) {
    tripCircuit(error);
    logger.error({ tag, error }, 'Cache invalidate by tag error');
    return 0;
  }
}

export async function cacheGetWithRefresh<T>(
  key: string,
  refresh: () => Promise<T>,
  ttlSeconds?: number
): Promise<T | null> {
  try {
    const cached = await cacheGetJson<T>(key);
    if (cached) return cached;

    const fresh = await refresh();
    await cacheSetJson(key, fresh, ttlSeconds);
    return fresh;
  } catch (error) {
    tripCircuit(error);
    logger.error({ key, error }, 'Cache get with refresh error');
    return null;
  }
}

// Cache warming: pre-populate keys using a loader map
export async function warmCache(
  loaders: Record<string, () => Promise<any>>,
  ttlSeconds?: number
): Promise<void> {
  const tasks = Object.entries(loaders).map(async ([k, fn]) => {
    try {
      const value = await fn();
      await cacheSetJson(k, value, ttlSeconds);
    } catch (err) {
      logger.warn({ key: k, err }, 'Cache warm failed for key');
    }
  });

  await Promise.all(tasks);
  logger.info({ count: Object.keys(loaders).length }, 'Cache warmed');
}

// Batch operations: multi-get and multi-set convenience helpers
export async function cacheMGetJson<T = any>(
  keys: string[]
): Promise<(T | null)[]> {
  try {
    if (checkCircuit()) return keys.map(() => null);
    const namespacedKeys = keys.map(getNamespacedKey);
    const values = await redis.mget(...namespacedKeys);
    return values.map((v) => (v ? JSON.parse(v) : null));
  } catch (error) {
    tripCircuit(error);
    logger.error({ keys, error }, 'Cache mget error');
    return keys.map(() => null);
  }
}

export async function cacheMSetJson(
  entries: Record<string, any>,
  ttlSeconds?: number
): Promise<void> {
  try {
    if (checkCircuit()) return;
    const multi = redis.multi();
    Object.entries(entries).forEach(([k, v]) => {
      const nk = getNamespacedKey(k);
      if (ttlSeconds) multi.set(nk, JSON.stringify(v), 'EX', ttlSeconds);
      else multi.set(nk, JSON.stringify(v));
    });
    await multi.exec();
  } catch (error) {
    tripCircuit(error);
    logger.error({ error }, 'Cache mset error');
  }
}

// Simple stats counters (in-process) for quick insight
export const stats = {
  hits: 0,
  misses: 0,
  errors: 0,
};

// Telemetry hook (optional)
let telemetryReporter: ((s: typeof stats) => void) | null = null;
export function setTelemetryReporter(fn: (s: typeof stats) => void) {
  telemetryReporter = fn;
}

// Wrap existing getters to bump counters
const originalCacheGet = cacheGet;
export async function cacheGetWithStats(key: string): Promise<string | null> {
  try {
    const res = await originalCacheGet(key);
    if (res) stats.hits += 1;
    else stats.misses += 1;
    return res;
  } catch (e) {
    stats.errors += 1;
    throw e;
  }
}

// Reporting: flush stats to logger/telemetry and optionally reset
export function reportStats({ reset = true } = {}) {
  try {
    logger.info({ cache: stats }, 'Cache stats report');
    if (telemetryReporter) {
      try {
        telemetryReporter({ ...stats });
      } catch (err) {
        logger.warn({ err }, 'Telemetry reporter failed');
      }
    }
    if (reset) {
      stats.hits = 0;
      stats.misses = 0;
      stats.errors = 0;
    }
  } catch (err) {
    logger.warn({ err }, 'Failed to report cache stats');
  }
}

// Auto-report stats periodically (only in non-test env)
if (process.env.NODE_ENV !== 'test') {
  const intervalMs =
    Number(process.env.CACHE_STATS_REPORT_INTERVAL_MS) || 60_000;
  setInterval(() => {
    try {
      reportStats();
    } catch (e) {
      // swallow
    }
  }, intervalMs).unref();
}

// Memory lightweight utility
export function estimateRedisMemoryUsage(
  keys: string[]
): Promise<Record<string, number>> {
  return Promise.all(
    keys.map(async (k) => {
      try {
        const nk = getNamespacedKey(k);
        // `MEMORY USAGE` expects uppercase 'USAGE' in ioredis typings
        const size = (await (redis as any)
          .memory('USAGE', nk)
          .catch(() => 0)) as number;
        return [k, size] as const;
      } catch {
        return [k, 0] as const;
      }
    })
  ).then((rows) => Object.fromEntries(rows) as Record<string, number>);
}

export default redis;
