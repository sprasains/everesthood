import { recordUsage, resolveCustomer } from '../lib/billing/stripe';
import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

export async function recordAgentRunBilling(runId: string, dryRun = false) {
  const run = await prisma.agentRun.findUnique({
    where: { id: runId },
    include: {
      agentInstance: { include: { user: true } },
      steps: true,
    },
  });
  if (!run) return;
  const user = run.agentInstance.user;
  const customerId = await resolveCustomer(user.id, user.email);
  await recordUsage({
    userId: user.id,
    customerId,
    tokensUsed: run.tokensUsed || 0,
    steps: run.steps.length,
    wallTime: run.finishedAt && run.startedAt ? (new Date(run.finishedAt).getTime() - new Date(run.startedAt).getTime()) / 1000 : 0,
    toolCalls: run.steps.reduce((sum, s) => sum + (s.output?.toolCalls?.length || 0), 0),
    cost: run.cost || 0,
    dryRun,
  });
}
