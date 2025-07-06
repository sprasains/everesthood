// LAYMAN: This file is the "worker"—it waits for jobs and runs the right agent, like a chef making the right dish for each order.
// BUSINESS: The worker service decouples agent execution from the web server, enabling scalable, reliable, and asynchronous processing of user requests.
// TECHNICAL: Listens to the BullMQ queue, dynamically imports agent modules from the registry, and stores job status/results in Redis.

import { Worker } from 'bullmq';
import { redis } from '../../lib/redis';
import { agentRegistry } from '../agents/registry';

console.log('Worker service starting...');

// LAYMAN: This worker listens for new jobs and runs the right agent for each one.
const worker = new Worker('agent-jobs', async job => {
  const { agentInstanceId, input, mode, userId } = job.data;
  console.log('Received job:', job.data);

  // LAYMAN: Look up which agent to run, like finding the right recipe for an order.
  // BUSINESS: Ensures only registered, approved agents are executed.
  // TECHNICAL: Uses the agent registry for safe dynamic import.
  const agentLoader = agentRegistry[agentInstanceId];
  if (!agentLoader) {
    const error = `No agent found for id: ${agentInstanceId}`;
    await redis.set(`agent-job:${job.id}:status`, 'failed');
    await redis.set(`agent-job:${job.id}:error`, error);
    throw new Error(error);
  }
  try {
    await redis.set(`agent-job:${job.id}:status`, 'in_progress');
    // LAYMAN: Import and run the agent's code.
    // BUSINESS: Executes the agent workflow with the provided input.
    // TECHNICAL: Await the agent's run function and store the result.
    const agentModule = await agentLoader();
    const result = await agentModule.run(input, mode, userId);
    await redis.set(`agent-job:${job.id}:status`, 'completed');
    await redis.set(`agent-job:${job.id}:result`, JSON.stringify(result), 'EX', 86400); // 1 day TTL
    return result;
  } catch (err: any) {
    await redis.set(`agent-job:${job.id}:status`, 'failed');
    await redis.set(`agent-job:${job.id}:error`, err?.message || 'Unknown error');
    throw err;
  }
}, { connection: redis });

worker.on('completed', job => {
  // LAYMAN: Let everyone know the job is done!
  // BUSINESS: Useful for monitoring and debugging.
  // TECHNICAL: Logs job completion.
  console.log(`Job ${job.id} has completed!`);
});

worker.on('failed', (job, err) => {
  // LAYMAN: Let everyone know something went wrong.
  // BUSINESS: Helps track down issues in agent execution.
  // TECHNICAL: Logs job failure and error details.
  console.error(`Job ${job?.id} has failed with error:`, err);
}); 