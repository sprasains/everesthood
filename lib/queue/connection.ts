/**
 * Shared BullMQ Redis connection factory with TLS, metrics, lazy init.
 * Env vars: REDIS_URL, REDIS_TLS
 * Usage: import { getRedisConnection } from './connection'
 */
import Redis from 'ioredis';

let redis: Redis | null = null;

export function getRedisConnection(): Redis {
  if (redis) return redis;
  const url = process.env.REDIS_URL || 'redis://localhost:6379';
  const tls = process.env.REDIS_TLS === 'true';
  const opts: any = { lazyConnect: true };
  if (tls) opts.tls = {};
  redis = new Redis(url, opts);
  // TODO: Add metrics, requestId logging, error handlers
  redis.on('error', (err: Error) => {
    console.error('[Redis] Error:', err);
  });
  return redis;
}
