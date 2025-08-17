// worker/index.js
// Production-ready agent job worker for EverestHood
// -------------------------------------------------
// This worker listens for jobs on the 'agent-jobs' queue, dynamically loads the correct agent module,
// executes it, and updates the AgentRun record in the database.

const { Worker } = require('bullmq');
const { agentJobQueue, connection } = require('../lib/queue');
const { PrismaClient } = require('@prisma/client');
const path = require('path');
const { getAgentHandler } = require(path.join(__dirname, '../src/agents'));
const { runAgentWorkflow } = require('../src/agents/runtime');
const { agentRegistry } = require('../src/agents/registry');
const { AgentRunInput } = require('../src/agents/contracts');
const pino = require('pino');
const logger = pino({ level: process.env.LOG_LEVEL || 'info' });
const { logCredentialAccess } = require('../lib/audit');
const { decrypt } = require('../lib/crypto');

const prisma = new PrismaClient();

const StepBuffer = require('./batchStepBuffer');
const stepBuffer = new StepBuffer(prisma, 10, 1000); // batch size 10, flush every 1s

const agentWorker = new Worker('agent-jobs', async job => {
  const { runId, agentInstanceId, input, templateName, userId } = job.data;
  // Idempotency: skip if already completed/failed
  const run = await prisma.agentRun.findUnique({ where: { id: runId } });
  if (!run || run.status === 'COMPLETED' || run.status === 'FAILED') {
    logger.info({ runId }, 'Skipping already processed job');
    return;
  }
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
    let creds = { ...instance.template.credentials, ...instance.configOverride?.credentials };
    // Fetch and decrypt AgentCredential if present
    const agentCred = await prisma.agentCredential.findFirst({
      where: { userId, agentId: agentInstanceId },
    });
    if (agentCred) {
      creds = {
        ...creds,
        key: decrypt(agentCred.encryptedKey),
        secret: decrypt(agentCred.encryptedSecret),
      };
      await logCredentialAccess({
        userId,
        agentId: agentInstanceId,
        action: 'CREDENTIAL_DECRYPT',
        provider: agentCred.provider,
        details: `runId=${runId}`,
      });
    }
    // Find agent in registry
    const agentDef = agentRegistry.find(a => a.key === handlerName);
    if (!agentDef) throw new Error(`No agent registered for key ${handlerName}`);
    // Prepare AgentRunInput
    const runInput = { userId, agentInstanceId, input };
    // Orchestrate multi-step run
    const result = await runAgentWorkflow(
      agentDef.steps || [{ name: agentDef.name, run: agentDef.run }],
      runInput,
      { creds },
      async step => {
        // Buffer step for batch DB write
        stepBuffer.add({
          runId,
          index: step.index,
          name: step.name,
          input: step.input,
          output: step.output,
          error: step.error,
          startedAt: new Date(step.startedAt),
          finishedAt: new Date(step.finishedAt),
        });
        // Optionally emit progress via SSE/Socket.IO
      }
    );
  // Flush any remaining steps for this run
  await stepBuffer.flush();
  await prisma.agentRun.update({
      where: { id: runId },
      data: {
        status: 'COMPLETED',
        tokensUsed: result.tokensUsed,
        cost: result.cost,
        finishedAt: new Date(),
      },
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
}, {
  connection,
  concurrency: 5,
  // Optionally, add job lock duration, etc.
});

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
