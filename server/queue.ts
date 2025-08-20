// server/queue.ts
// Centralized BullMQ queue, worker, and scheduler initialization (server-only)
import { Queue } from 'bullmq';
import { JobScheduler } from 'bullmq/dist/esm/classes/job-scheduler.js';
import Redis from 'ioredis';

const redisUrl = process.env.REDIS_URL || 'redis://localhost:6379';
const connection = new Redis(redisUrl);

const queueName = 'agent-jobs';

const agentJobQueue = new Queue(queueName, { connection });
const agentJobScheduler = new JobScheduler(queueName, { connection });

export { agentJobQueue, agentJobScheduler, connection };
