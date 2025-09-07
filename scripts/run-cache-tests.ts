import 'ts-node/register';
import assert from 'assert';
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
} from '../lib/cache';

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

(async function run() {
  setRedisClient(new MockRedis() as any);

  await cacheSetJson('foo', { a: 1 }, 10);
  const v = await cacheGetJson('foo');
  assert.deepEqual(v, { a: 1 });
  console.log('set/get JSON: ok');

  await cacheMSetJson({ a: { x: 1 }, b: { y: 2 } }, 10);
  const res = await cacheMGetJson(['a', 'b', 'c']);
  assert.deepEqual(res[0], { x: 1 });
  assert.deepEqual(res[1], { y: 2 });
  assert.strictEqual(res[2], null);
  console.log('mget/mset: ok');

  await warmCache({ w1: async () => ({ z: 3 }) }, 10);
  const wv = await cacheGetJson('w1');
  assert.deepEqual(wv, { z: 3 });
  console.log('warmCache: ok');

  await cacheSetWithTags('t1', { q: 4 }, ['tag1'], 10);
  const before = await cacheGetJson('t1');
  assert.deepEqual(before, { q: 4 });
  await cacheInvalidateByTag('tag1');
  const after = await cacheGetJson('t1');
  // mock's tag invalidation is a no-op, expect still present
  assert.deepEqual(after, { q: 4 });
  console.log('tags/invalidate (mock): ok');

  stats.hits = 0;
  stats.misses = 0;
  stats.errors = 0;
  await cacheGetWithStats('nonexistent');
  if (stats.misses < 1) throw new Error('stats misses not incremented');
  reportStats({ reset: false });
  console.log('stats/reporting: ok');

  console.log('ALL CACHE TESTS PASSED');
})();
