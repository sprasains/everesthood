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
  for (const instance of dueInstances) {
    // Enqueue a job for each due instance
    await agentJobQueue.add('run-agent', {
      agentInstanceId: instance.id,
      templateName: instance.template.name,
      userId: instance.userId,
      input: instance.defaultInput || {},
      // Add more fields as needed
    }, {
      attempts: 5,
      backoff: { type: 'exponential', delay: 5000 },
      removeOnComplete: true,
      removeOnFail: false,
      // Optionally, set a dead-letter queue
      // deadLetterQueue: 'agent-jobs-dlq',
    });
  }
}

module.exports = { checkAndEnqueueDueAgents };
