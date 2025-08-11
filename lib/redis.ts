// BullMQ queue and Redis client export for agent jobs
import { Queue } from 'bullmq';
import Redis from 'ioredis';
import { isRedisBypassed } from './featureFlags';

const queueName = 'agent-jobs';
const redisUrl = process.env.REDIS_URL || 'redis://localhost:6379';

let redis: any;
let agentJobQueue: Queue<any, any, string>;
let initialised = false;

async function init() {
  if (initialised) return;
  if (await isRedisBypassed?.()) {
    console.warn('[DEV] Redis bypassed; queue ops are no-ops');
    redis = { get: async () => null, set: async () => true };
    agentJobQueue = {
      add: async () => true,
      addBulk: async () => true,
    } as any;
  } else {
    redis = new Redis(redisUrl);
    agentJobQueue = new Queue(queueName, { connection: redis });
  }
  initialised = true;
}

export async function getRedis() {
  await init();
  return redis;
}

export async function getAgentJobQueue() {
  await init();
  return agentJobQueue;
}