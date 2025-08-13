// Layman: This script checks which agents need to run on a schedule and adds them to the job queue, just like a user would.
// Business: Ensures all scheduled agent runs use the same execution workflow as user-triggered runs, for unified monitoring and scaling.
// Technical: Queries AgentInstance with cronSchedule, uses node-cron to trigger jobs, and enqueues to agentJobQueue from lib/redis.

const { agentJobQueue, connection } = require('../../lib/queue');
const cron = require('node-cron');
const Redlock = require('redlock');
const { checkAndEnqueueDueAgents } = require('./helpers'); // You must implement this

const SCHEDULE = '* * * * *'; // every minute

async function startScheduler() {
  const redlock = new Redlock([connection], { retryCount: 0 });
  cron.schedule(SCHEDULE, async () => {
    try {
      await redlock.using(['agent-scheduler-lock'], 55000, async () => {
        // Pass the singleton queue to your helper
        await checkAndEnqueueDueAgents(agentJobQueue);
      });
    } catch (err) {
      if (err.name !== 'LockError') console.error('Scheduler error:', err);
    }
  });
  console.log('Agent scheduler started.');
}

startScheduler();