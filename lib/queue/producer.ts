import { Queue } from 'bullmq';
import * as path from 'path';
import { getRedis } from './connection';
import { RunJobSchema, RunJob, CronJobSchema, CronJob } from './types';

const connection = getRedis();

const defaultPrefix = process.env.REDIS_PREFIX || 'everest:';

export const agentQueue = new Queue<RunJob>('agent-run', {
  connection,
  prefix: defaultPrefix,
});

export async function enqueueRun(payload: RunJob) {
  const parsed = RunJobSchema.parse(payload);
  // idempotent jobId uses runId so re-adding the same run won't duplicate
  const jobId = parsed.runId;
  // job name includes agentInstanceId for easy filtering in UIs
  const jobName = `run:${parsed.agentInstanceId}:${parsed.runId}`;
  return agentQueue.add(jobName, parsed, {
    jobId,
    removeOnComplete: { age: 60 * 60, count: 1000 },
    removeOnFail: { age: 60 * 60 * 24, count: 100 },
    attempts: 5,
    backoff: {
      type: 'exponential',
      delay: 1000,
    },
  });
}

export const cronQueue = new Queue<CronJob>('agent-cron', {
  connection,
  prefix: defaultPrefix,
});

// Expose a DLQ queue for monitoring and admin tooling
export const dlqQueue = new Queue<any>('agent-run-dlq', {
  connection,
  prefix: defaultPrefix,
});

export async function enqueueCron(job: CronJob) {
  const parsed = CronJobSchema.parse(job);
  return cronQueue.add('cron', parsed, {
    removeOnComplete: true,
    // cast to any to avoid tight RepeatOptions typing across BullMQ versions
    repeat: { cron: parsed.schedule, tz: parsed.timezone } as any,
  });
}
