// Scheduler: checks which agents need to run on a cron and enqueues them via the central queue.

// Scheduler: finds agent instances that should run on a cron schedule and
// enqueues them via the centralized enqueueRun helper. Uses Redlock to
// ensure only one scheduler instance enqueues at a time and records simple
// metrics in Redis.

const cron = require('node-cron');
const Redlock = require('redlock');
const { getRedis } = require('../../lib/queue/connection');
const { checkAndEnqueueDueAgents } = require('./helpers');

const SCHEDULE = process.env.SCHEDULER_CRON || '* * * * *'; // default every minute
const LOCK_KEY = process.env.SCHEDULER_LOCK_KEY || 'agent-scheduler-lock';
const LOCK_TTL = parseInt(process.env.SCHEDULER_LOCK_TTL || '55000', 10);

/**
 * node-cron returns a ScheduledTask which exposes stop/start. Use any to
 * avoid pulling types from node-cron here.
 */
let scheduledTask: any;
let redlock: any | null = null;

async function startScheduler() {
  const redis = getRedis();
  redlock = new Redlock([redis], { retryCount: 1, retryDelay: 200 });

  scheduledTask = cron.schedule(SCHEDULE, async () => {
    const start = Date.now();
    try {
      await redlock.using([LOCK_KEY], LOCK_TTL, async () => {
        const enqueued = await checkAndEnqueueDueAgents();
        // increment metric counter
        try {
          if (typeof enqueued === 'number') {
            await redis.incrby('scheduler:enqueued_count', enqueued);
          }
          await redis.incr('scheduler:tick_count');
        } catch (mErr) {
          console.warn('Scheduler metric increment failed', mErr);
        }
      });
    } catch (err: any) {
      if (err && err.name === 'LockError') {
        // another scheduler holds the lock — not an error
        return;
      }
      console.error('[Scheduler] error', err);
    } finally {
      const duration = Date.now() - start;
      try {
        await getRedis().set(
          'scheduler:last_tick_duration_ms',
          String(duration)
        );
      } catch (e) {
        // ignore metric set failures
      }
      console.info(`[Scheduler] tick completed in ${duration}ms`);
    }
  });

  console.info('[Scheduler] started with schedule:', SCHEDULE);
}

function stopScheduler() {
  if (scheduledTask) {
    try {
      scheduledTask.stop();
    } catch (e) {
      // ignore
    }
  }
  if (redlock) {
    try {
      redlock.quit && redlock.quit();
    } catch (e) {
      // ignore
    }
  }
  console.info('[Scheduler] stopped');
}

process.on('SIGTERM', async () => {
  console.info('[Scheduler] SIGTERM received, shutting down...');
  stopScheduler();
  process.exit(0);
});

// start only if this file is executed directly
if (require.main === module) {
  startScheduler();
}

module.exports = { startScheduler, stopScheduler };
