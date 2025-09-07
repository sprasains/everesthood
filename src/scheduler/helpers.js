// src/scheduler/helpers.js
// Example implementation for checkAndEnqueueDueAgents
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

/**
 * Finds agent instances with a cronSchedule due and enqueues jobs for them.
 * @param {import('bullmq').Queue} agentJobQueue
 */
async function checkAndEnqueueDueAgents(agentJobQueue) {
  // Find all agent instances with a cronSchedule due (implement your own logic)
  const now = new Date();
  const dueInstances = await prisma.agentInstance.findMany({
    where: {
      cronSchedule: { not: null },
      // Add your own due logic here (e.g., lastRunAt < now - interval)
    },
    include: { template: true, user: true },
  });
  const { enqueueRun } = require('../../lib/queue/producer');
  const { randomUUID } = require('crypto');
  let enqueued = 0;
  for (const instance of dueInstances) {
    try {
      // Create run record (tenant isolation and cost checks are expected elsewhere)
      const run = await prisma.agentRun.create({
        data: {
          agentInstanceId: instance.id,
          userId: instance.userId,
          status: 'PENDING',
          input: instance.defaultInput || {},
        },
      });

      const requestId = randomUUID();
      await enqueueRun({
        runId: run.id,
        agentInstanceId: instance.id,
        userId: instance.userId,
        input: instance.defaultInput || {},
        requestId,
      });
      enqueued += 1;
    } catch (err) {
      console.error('Failed to enqueue scheduled agent', instance.id, err);
      // continue with other instances
    }
  }
  return enqueued;
}

module.exports = { checkAndEnqueueDueAgents };
