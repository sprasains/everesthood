const { Worker } = require('bullmq');
const Redis = require('ioredis');
const { PrismaClient } = require('@prisma/client');
const { agentRegistry } = require('../src/agents/registry');

const prisma = new PrismaClient();
const redisUrl = process.env.REDIS_URL || 'redis://localhost:6379';
const connection = new Redis(redisUrl);

const worker = new Worker('agent-jobs', async job => {
  const { agentInstanceId, input, mode, userId } = job.data;

  try {
    const agentInstance = await prisma.agentInstance.findUnique({
      where: {
        id: agentInstanceId,
        userId: userId, // Enforce multi-tenancy
      },
      include: {
        agent: true,
      },
    });

    if (!agentInstance) {
      throw new Error(`Agent instance not found: ${agentInstanceId}`);
    }

    const agent = agentRegistry[agentInstance.agent.type];

    if (!agent) {
      throw new Error(`Agent not found in registry: ${agentInstance.agent.type}`);
    }

    const agentModule = await agent();
    const result = await agentModule.run(input, mode, userId);

    await prisma.user.update({
      where: {
        id: userId,
      },
      data: {
        currentMonthExecutionCount: {
          increment: 1,
        },
      },
    });

    const user = await prisma.user.findUnique({ where: { id: userId } });

    if (user.stripeSubscriptionId) {
      const subscription = await stripe.subscriptions.retrieve(user.stripeSubscriptionId);
      const subscriptionItem = subscription.items.data[0];

      if (subscriptionItem) {
        await stripe.subscriptionItems.createUsageRecord(subscriptionItem.id, {
          quantity: 1,
          action: 'increment',
        });
      }
    }

    await prisma.log.create({
      data: {
        agentInstanceId,
        userId,
        input,
        output: result,
        status: 'completed',
      },
    });

    console.log('Agent job completed:', result);
  } catch (error) {
    console.error('Error processing agent job:', error);
    await prisma.log.create({
      data: {
        agentInstanceId,
        userId,
        input,
        output: { error: error.message },
        status: 'failed',
      },
    });
    throw error;
  }
}, { connection });

worker.on('completed', job => {
  console.log(`Job ${job.id} has completed!`);
});

worker.on('failed', (job, err) => {
  console.error(`Job ${job.id} has failed with error:`, err);
}); 