// lib/queue.ts
// Centralized BullMQ queue, worker, and scheduler initialization
var BullMQ = require('bullmq');
var QueueScheduler;
try {
    QueueScheduler = BullMQ.QueueScheduler;
}
catch (e) {
    QueueScheduler = require('bullmq/dist/classes/queue-scheduler').QueueScheduler;
}
var Redis = require('ioredis');
var redisUrl = process.env.REDIS_URL || 'redis://localhost:6379';
var connection = new Redis(redisUrl);
var queueName = 'agent-jobs';
var agentJobQueue = new BullMQ.Queue(queueName, { connection: connection });
var agentJobScheduler = new QueueScheduler(queueName, { connection: connection });
// Compatibility shim for older CommonJS code: re-export server/queue's exports
const { agentJobQueue, agentJobScheduler, connection } = require('../server/queue');
module.exports = { agentJobQueue, agentJobScheduler, connection };
