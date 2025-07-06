import { Queue } from 'bullmq';
import Redis from 'ioredis';

const redisUrl = process.env.REDIS_URL || 'redis://localhost:6379';

export const redis = new Redis(redisUrl);

export const agentJobQueue = new Queue('agent-jobs', {
  connection: redis,
}); 