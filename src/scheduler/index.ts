// Layman: This script checks which agents need to run on a schedule and adds them to the job queue, just like a user would.
// Business: Ensures all scheduled agent runs use the same execution workflow as user-triggered runs, for unified monitoring and scaling.
// Technical: Queries AgentInstance with cronSchedule, uses node-cron to trigger jobs, and enqueues to agentJobQueue from lib/redis.

import { prisma } from '../../lib/prisma';
import { agentJobQueue } from '../../lib/redis';
import cron from 'node-cron';
import Redlock from 'redlock';
import { getRedis, getAgentJobQueue } from '../../lib/redis';
import { checkAndEnqueueDueAgents } from './helpers'; // You must implement this
import { DateTime } from 'luxon';
import { isRedisBypassed } from '../../lib/featureFlags';

const SCHEDULE = '* * * * *'; // every minute

let redis: any;
let redlock: any;
let initialized = false;

async function initRedis() {
  if (initialized) return;
  if (await isRedisBypassed()) {
    // eslint-disable-next-line no-console
    console.warn('[DEV] Redis/Redlock are bypassed in scheduler (feature flag). All operations are no-ops.');
    redis = {
      get: async () => null,
      set: async () => true,
      del: async () => true,
    };
    redlock = {
      acquire: async () => true,
      release: async () => true,
    };
  } else {
    redis = await getRedis();
    redlock = new Redlock([redis], { retryCount: 0 });
  }
  initialized = true;
}

async function getScheduledAgentInstances() {
  return prisma.agentInstance.findMany({
    where: {
      cronSchedule: {
        not: null,
      },
    },
  });
}

async function enqueueAgentJob(agentInstance: any) {
  await agentJobQueue.add('run-agent', {
    agentInstanceId: agentInstance.id,
    input: {}, // You may want to customize this for your use case
    mode: 'scheduled',
    userId: agentInstance.userId,
  });
  console.log(`[Scheduler] Enqueued scheduled run for agentInstance ${agentInstance.id}`);
}

async function checkAndEnqueueDueAgents() {
  const now = DateTime.utc();
  const agents = await getScheduledAgentInstances();
  for (const agent of agents) {
    if (!agent.cronSchedule) continue;
    try {
      const interval = cronParser.parseExpression(agent.cronSchedule, { currentDate: now.minus({ minute: 1 }).toJSDate() });
      const next = DateTime.fromJSDate(interval.next().toDate());
      // If the next scheduled time is within the last minute, enqueue
      if (next <= now && next > now.minus({ minute: 1 })) {
        await enqueueAgentJob(agent);
      }
    } catch (err) {
      console.error(`[Scheduler] Invalid cron for agentInstance ${agent.id}:`, err);
    }
  }
}

async function startScheduler() {
  await initRedis();
  cron.schedule(SCHEDULE, async () => {
    try {
      await redlock.using(['agent-scheduler-lock'], 55000, async () => {
        await checkAndEnqueueDueAgents(await getAgentJobQueue());
      });
    } catch (err) {
      if (err.name !== 'LockError') console.error('Scheduler error:', err);
    }
  });
  console.log('Agent scheduler started.');
}

startScheduler();