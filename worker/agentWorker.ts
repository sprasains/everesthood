import { Worker, Queue, JobsOptions, QueueEvents } from 'bullmq';
import { getRedis } from '../lib/queue/connection';
import { RunJob } from '../lib/queue/types';
import { prisma } from '../src/server/db';
const pino = require('pino');

const logger = pino({ name: 'agent-worker' });
const connection = getRedis();

// DLQ queue for failed jobs that exhausted retries
const dlq = new Queue('agent-run-dlq', { connection });

const worker = new Worker<RunJob>(
  'agent-run',
  async (job) => {
    const { runId, agentInstanceId, userId, input, requestId } = job.data;

    const logCtx = { runId, jobId: job.id, requestId };
    logger.info(logCtx, 'Starting agent run');

    // Update DB to running
    await prisma.agentRun.update({
      where: { id: runId },
      data: { status: 'RUNNING', startedAt: new Date() },
    });

    try {
      // Load agent executor and run
      // ... existing agent runtime integration goes here
      const result = { message: 'no-op' };

      // update success
      await prisma.agentRun.update({
        where: { id: runId },
        data: { status: 'COMPLETED', finishedAt: new Date() },
      });
      logger.info(logCtx, 'Completed agent run');
      return result;
    } catch (err: any) {
      logger.error({ ...logCtx, err: err?.message || err }, 'Agent run failed');
      await prisma.agentRun.update({
        where: { id: runId },
        data: {
          status: 'FAILED',
          finishedAt: new Date(),
        },
      });
      // record an event with the error for observability
      try {
        await prisma.agentEvent.create({
          data: {
            agentRunId: runId,
            eventType: 'error',
            payload: { message: err?.message || String(err) },
          },
        });
      } catch (e) {
        // ignore event logging failures
      }
      throw err;
    }
  },
  {
    connection,
    concurrency: parseInt(process.env.WORKER_CONCURRENCY || '4', 10),
  }
);

worker.on('completed', (job) =>
  logger.info({ jobId: job.id, runId: job.data.runId }, 'job completed')
);
worker.on('failed', (job, err) =>
  logger.error(
    { jobId: job?.id, runId: job?.data?.runId, err: err?.message },
    'job failed'
  )
);

worker.on('failed', async (job, err) => {
  try {
    if (!job) return;
    const attemptsMade = (job.attemptsMade || 0) as number;
    const maxAttempts = 5; // mirror producer default
    if (attemptsMade >= maxAttempts) {
      // push to DLQ for manual inspection
      await dlq.add(
        'dlq',
        {
          ...job.data,
          failedAt: new Date().toISOString(),
          lastError: err?.message,
        },
        { removeOnComplete: true }
      );
      logger.warn(
        { jobId: job.id, runId: job.data.runId },
        'Moved job to DLQ after exhausting attempts'
      );
    }
  } catch (e) {
    logger.error({ err: e }, 'Failed to move job to DLQ');
  }
});

// graceful shutdown
process.on('SIGTERM', async () => {
  logger.info('SIGTERM received, closing worker...');
  try {
    await worker.close();
    logger.info('Worker closed');
    process.exit(0);
  } catch (err) {
    logger.error({ err }, 'Error closing worker');
    process.exit(1);
  }
});

export default worker;
