// Layman: This file provides simple functions to store and retrieve data in Redis, so we don't have to fetch from the database every time.
// Business: Generic cache utility for storing and retrieving arbitrary data in Redis, reducing database load and improving performance.
// Technical: Provides async get, set, and del methods using the shared Redis client. Data is JSON-serialized. TTL is supported for set.

import { getRedis } from './redis';

let cacheGetImpl: <T = any>(key: string) => Promise<T | null>;
let cacheSetImpl: (key: string, value: any, ttlSeconds?: number) => Promise<void>;
let cacheDelImpl: (key: string) => Promise<void>;

cacheGetImpl = async function<T = any>(key: string): Promise<T | null> {
  const redis = await getRedis();
  const value = await redis.get(key);
  if (!value) return null;
  return JSON.parse(value) as T;
};
cacheSetImpl = async function(key: string, value: any, ttlSeconds?: number): Promise<void> {
  const redis = await getRedis();
  const serialized = JSON.stringify(value);
  if (ttlSeconds) {
    await redis.set(key, serialized, 'EX', ttlSeconds);
  } else {
    await redis.set(key, serialized);
  }
};
cacheDelImpl = async function(key: string): Promise<void> {
  const redis = await getRedis();
  await redis.del(key);
};

export const cacheGet = cacheGetImpl;
export const cacheSet = cacheSetImpl;
export const cacheDel = cacheDelImpl; 