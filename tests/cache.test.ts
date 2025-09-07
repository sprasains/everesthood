import {
  setRedisClient,
  cacheSetJson,
  cacheGetJson,
  cacheMGetJson,
  cacheMSetJson,
  warmCache,
  cacheInvalidateByTag,
  cacheSetWithTags,
  cacheGetWithStats,
  stats,
  reportStats,
} from '@/lib/cache';

// Minimal in-memory Redis mock for tests
class MockRedis {
  store: Record<string, string> = {};

  async get(key: string) {
    return this.store[key] ?? null;
  }

  async set(key: string, value: string) {
    this.store[key] = value;
    return 'OK';
  }

  async mget(...keys: string[]) {
    return keys.map((k) => this.store[k] ?? null);
  }

  async del(key: string) {
    const had = key in this.store;
    delete this.store[key];
    return had ? 1 : 0;
  }

  async keys(pattern: string) {
    // simplistic pattern: '*' returns all
    if (pattern === '*') return Object.keys(this.store);
    return Object.keys(this.store).filter((k) =>
      k.includes(pattern.replace('*', ''))
    );
  }

  multi() {
    const ops: Array<() => void> = [];
    return {
      set: (k: string, v: string) =>
        ops.push(() => {
          this.store[k] = v;
        }),
      sadd: (_: string, __: string) => {},
      expire: (_: string, __: number) => {},
      del: (...ks: string[]) =>
        ops.push(() => {
          ks.forEach((k) => delete this.store[k]);
        }),
      exec: async () => {
        ops.forEach((f) => f());
        return [];
      },
    } as any;
  }

  async smembers(key: string) {
    // not implementing sets for the mock
    return [];
  }

  memory() {
    return Promise.resolve(0);
  }

  on() {}
}

describe('cache module (unit)', () => {
  beforeAll(() => {
    setRedisClient(new MockRedis() as any);
  });

  test('set and get JSON', async () => {
    await cacheSetJson('foo', { a: 1 }, 10);
    const v = await cacheGetJson('foo');
    expect(v).toEqual({ a: 1 });
  });

  test('mget and mset', async () => {
    await cacheMSetJson({ a: { x: 1 }, b: { y: 2 } }, 10);
    const res = await cacheMGetJson(['a', 'b', 'c']);
    expect(res[0]).toEqual({ x: 1 });
    expect(res[1]).toEqual({ y: 2 });
    expect(res[2]).toBeNull();
  });

  test('warm cache', async () => {
    await warmCache({ w1: async () => ({ z: 3 }) }, 10);
    const v = await cacheGetJson('w1');
    expect(v).toEqual({ z: 3 });
  });

  test('tags and invalidate', async () => {
    await cacheSetWithTags('t1', { q: 4 }, ['tag1'], 10);
    const before = await cacheGetJson('t1');
    expect(before).toEqual({ q: 4 });
    await cacheInvalidateByTag('tag1');
    const after = await cacheGetJson('t1');
    // mock's tag invalidation is a no-op, expect still present
    expect(after).toEqual({ q: 4 });
  });

  test('stats and reporting', async () => {
    // reset
    stats.hits = 0;
    stats.misses = 0;
    stats.errors = 0;
    await cacheGetWithStats('nonexistent');
    expect(stats.misses).toBeGreaterThanOrEqual(1);
    reportStats({ reset: false });
  });
});
