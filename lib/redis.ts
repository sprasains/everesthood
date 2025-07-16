import { Queue } from 'bullmq';
import Redis from 'ioredis';
import { isRedisBypassed } from './featureFlags';

const redisUrl = process.env.REDIS_URL || 'redis://localhost:6379';

let redis: any;
let agentJobQueue: any;
let initialized = false;

async function initRedis() {
  if (initialized) return;
  if (await isRedisBypassed()) {
    // eslint-disable-next-line no-console
    console.warn('[DEV] Redis is bypassed (feature flag). All cache/queue operations are no-ops.');
    redis = {
      get: async () => null,
      set: async () => true,
      del: async () => true,
    };
    agentJobQueue = {
      add: async () => true,
      addBulk: async () => true,
      getJob: async () => null,
      getJobs: async () => [],
    };
  } else {
    redis = new Redis(redisUrl);
    agentJobQueue = new Queue('agent-jobs', {
      connection: redis,
    });
  }
  initialized = true;
}

export async function getRedis() {
  await initRedis();
  return redis;
}

export async function getAgentJobQueue() {
  await initRedis();
  return agentJobQueue;
} 