import { NextRequest } from 'next/server';
import { prisma } from '../../../../prisma';
import { agentJobQueue } from '../../../../lib/queue';
import { requireUser } from '../../../../lib/auth/guard';
import { z } from 'zod';
import { setSecureHeaders } from '../../../../lib/security/headers';

const AgentRunInputSchema = z.object({
  input: z.any(),
  userId: z.string(),
});

// POST /api/agents/[id]/runs - enqueue agent run
export async function POST(req: NextRequest, { params }: { params: { id: string } }) {
  setSecureHeaders();
  let session;
  try {
    session = requireUser(req);
  } catch (err: any) {
    return new Response(JSON.stringify({ error: err.message }), { status: err.status || 401 });
  }
  const body = await req.json();
  const result = AgentRunInputSchema.safeParse(body);
  if (!result.success) {
    return new Response(JSON.stringify({ error: 'Invalid input', details: result.error.errors }), { status: 400 });
  }
  // Tenant isolation: only allow user to enqueue for self
  if (result.data.userId !== session.userId) {
    return new Response(JSON.stringify({ error: 'Forbidden' }), { status: 403 });
  }
  // Rate limiting (pseudo-code, implement KV/counter)
  // if (await isRateLimited(session.userId)) {
  //   return new Response(JSON.stringify({ error: 'Rate limit exceeded' }), { status: 429 });
  // }
  const run = await prisma.agentRun.create({
    data: {
      userId: session.userId,
      agentInstanceId: params.id,
      status: 'PENDING',
      startedAt: new Date(),
    },
  });
  await agentJobQueue.add('run', {
    runId: run.id,
    agentInstanceId: params.id,
    input: result.data.input,
    userId: session.userId,
    templateName: '',
  });
  return new Response(JSON.stringify({ runId: run.id }), { status: 202 });
}

// GET /api/agents/[id]/runs - list runs for agent instance
export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
  setSecureHeaders();
  let session;
  try {
    session = requireUser(req);
  } catch (err: any) {
    return new Response(JSON.stringify({ error: err.message }), { status: err.status || 401 });
  }
  // Tenant isolation: only allow user to view their own runs
  const runs = await prisma.agentRun.findMany({
    where: { agentInstanceId: params.id, userId: session.userId },
    orderBy: { startedAt: 'desc' },
    include: { steps: true },
  });
  return new Response(JSON.stringify(runs), { status: 200 });
}
