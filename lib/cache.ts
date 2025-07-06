// Layman: This file provides simple functions to store and retrieve data in Redis, so we don't have to fetch from the database every time.
// Business: Generic cache utility for storing and retrieving arbitrary data in Redis, reducing database load and improving performance.
// Technical: Provides async get, set, and del methods using the shared Redis client. Data is JSON-serialized. TTL is supported for set.

import { redis } from './redis';

export async function cacheGet<T = any>(key: string): Promise<T | null> {
  const value = await redis.get(key);
  if (!value) return null;
  return JSON.parse(value) as T;
}

export async function cacheSet(key: string, value: any, ttlSeconds?: number): Promise<void> {
  const serialized = JSON.stringify(value);
  if (ttlSeconds) {
    await redis.set(key, serialized, 'EX', ttlSeconds);
  } else {
    await redis.set(key, serialized);
  }
}

export async function cacheDel(key: string): Promise<void> {
  await redis.del(key);
} 