// Everhood BullMQ Worker Example
// ---------------------------------------------
// This worker listens for LLM/AI jobs on a Redis-backed queue using BullMQ.
// It processes jobs (e.g., code generation, summaries) and updates the database.
//
// How it works (in plain English):
// 1. The main app adds jobs to a queue ("llm-jobs") in Redis when an AI task is needed.
// 2. This worker listens for new jobs on that queue.
// 3. When a job arrives, the worker processes it (calls OpenAI/Gemini, etc.).
// 4. The worker saves the result/status back to the database.
// 5. The app can then show the result to the user.
//
// This pattern is called a "producer-consumer" or "job queue" architecture.
//
// Pros:
// - Decouples heavy/slow AI work from the web server (keeps UI fast)
// - Can scale workers independently (add more for more throughput)
// - Handles retries, failures, and job persistence
//
// Cons:
// - More moving parts (need Redis, worker process)
// - Slightly more complex to debug
// - Need to keep queue and job schema in sync

const { Worker } = require('bullmq');
const IORedis = require('ioredis');
const { PrismaClient } = require('@prisma/client');

const redisUrl = process.env.REDIS_URL || 'redis://localhost:6379';
const connection = new IORedis(redisUrl);
const prisma = new PrismaClient();

const queueName = 'llm-jobs'; // Must match the queue used by the app

// Main job processor function
async function processJob(job) {
  console.log('Received job:', job.id, job.name, job.data);
  // Simulate LLM API call (replace with real OpenAI/Gemini logic)
  const result = `Simulated LLM result for prompt: ${job.data.prompt}`;
  // Save result to DB (replace with your model/table)
  if (job.data.dbId) {
    await prisma.llmJob.update({
      where: { id: job.data.dbId },
      data: { status: 'completed', result },
    });
  }
  return result;
}

// Start the BullMQ worker
const worker = new Worker(queueName, processJob, { connection });

worker.on('completed', (job, result) => {
  console.log(`Job ${job.id} completed:`, result);
});
worker.on('failed', (job, err) => {
  console.error(`Job ${job.id} failed:`, err);
});

console.log(`Worker started for queue: ${queueName}. Waiting for jobs...`);

// Graceful shutdown
process.on('SIGINT', async () => {
  console.log('Shutting down worker...');
  await worker.close();
  await prisma.$disconnect();
  process.exit(0);
});
