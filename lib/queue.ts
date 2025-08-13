// lib/queue.ts
// Centralized BullMQ queue, worker, and scheduler initialization
const BullMQ = require('bullmq');
let QueueScheduler;
try {
  QueueScheduler = BullMQ.QueueScheduler;
} catch (e) {
  QueueScheduler = require('bullmq/dist/classes/queue-scheduler').QueueScheduler;
}
const Redis = require('ioredis');

const redisUrl = process.env.REDIS_URL || 'redis://localhost:6379';
const connection = new Redis(redisUrl);

const queueName = 'agent-jobs';

const agentJobQueue = new BullMQ.Queue(queueName, { connection });
const agentJobScheduler = new QueueScheduler(queueName, { connection });

module.exports = { agentJobQueue, agentJobScheduler, connection };
