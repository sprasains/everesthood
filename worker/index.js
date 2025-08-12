// worker/index.js
// Production-ready agent job worker for EverestHood
// -------------------------------------------------
// This worker listens for jobs on the 'agent-jobs' queue, dynamically loads the correct agent module,
// executes it, and updates the AgentRun record in the database.
//
// How it works:
// 1. The app enqueues a job (with agentInstanceId, runId, input, etc.)
// 2. The worker fetches the AgentInstance and AgentTemplate from the DB
// 3. It loads the correct agent handler from src/agents
// 4. It merges credentials (instance → template → env)
// 5. It calls the agent's run() function
// 6. It updates the AgentRun record with status/output/error

const { Worker } = require('bullmq');
const IORedis = require('ioredis');
const { PrismaClient } = require('@prisma/client');
const path = require('path');
const { getAgentHandler } = require(path.join(__dirname, '../src/agents'));
const pino = require('pino');

const prisma = new PrismaClient();
const redis = new IORedis(process.env.REDIS_URL || 'redis://localhost:6379');
const logger = pino({ level: process.env.LOG_LEVEL || 'info' });

const agentWorker = new Worker('agent-jobs', async job => {
  const { runId, agentInstanceId, input, templateName, userId } = job.data;
  logger.info({ runId, agentInstanceId, templateName, userId }, 'Job started');
  await prisma.agentRun.update({
    where: { id: runId },
    data: { status: 'RUNNING', startedAt: new Date() },
  });
  try {
    // fetch instance & template for credentials/config
    const instance = await prisma.agentInstance.findUnique({
      where: { id: agentInstanceId },
      include: { template: true },
    });
    if (!instance) throw new Error(`AgentInstance ${agentInstanceId} not found`);
    const handlerName = instance.template.metadata?.moduleName || templateName;
    const handler = getAgentHandler(handlerName);
    if (!handler) throw new Error(`No handler for agent ${handlerName}`);
    // credentials: override → template → env
    const creds = { ...instance.template.credentials, ...instance.configOverride?.credentials };
    const result = await handler.run(input, 'run', userId, creds);
    await prisma.agentRun.update({
      where: { id: runId },
      data: { status: 'COMPLETED', output: result, completedAt: new Date() },
    });
    logger.info({ runId, agentInstanceId, templateName, userId }, 'Job completed');
  } catch (err) {
    logger.error({ runId, agentInstanceId, templateName, userId, err }, 'Job failed');
    await prisma.agentRun.update({
      where: { id: runId },
      data: { status: 'FAILED', error: err.message, completedAt: new Date() },
    });
    throw err;
  }
}, { connection: redis });

agentWorker.on('completed', job => logger.info({ runId: job.data.runId }, 'Run completed'));
agentWorker.on('failed', (job, err) => logger.error({ runId: job.data.runId, err }, 'Run failed'));

logger.info('Agent worker started. Waiting for jobs...');

// Graceful shutdown
process.on('SIGINT', async () => {
  logger.info('Shutting down worker...');
  await agentWorker.close();
  await prisma.$disconnect();
  process.exit(0);
});
