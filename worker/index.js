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

const prisma = new PrismaClient();
const redis = new IORedis(process.env.REDIS_URL || 'redis://localhost:6379');

const agentWorker = new Worker('agent-jobs', async job => {
  const { runId, agentInstanceId, input, templateName, userId } = job.data;
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
  } catch (err) {
    console.error('Agent job failed:', err);
    await prisma.agentRun.update({
      where: { id: runId },
      data: { status: 'FAILED', error: err.message, completedAt: new Date() },
    });
    throw err;
  }
}, { connection: redis });

agentWorker.on('completed', job => console.log(`Run ${job.data.runId} completed`));
agentWorker.on('failed', (job, err) => console.error(`Run ${job.data.runId} failed`, err));

console.log('Agent worker started. Waiting for jobs...');

// Graceful shutdown
process.on('SIGINT', async () => {
  console.log('Shutting down worker...');
  await agentWorker.close();
  await prisma.$disconnect();
  process.exit(0);
});
