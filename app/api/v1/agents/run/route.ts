// app/api/v1/agents/run/route.ts
import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { enqueueRun } from '@/lib/queue/producer';

export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id)
    return new NextResponse('Unauthorized', { status: 401 });

  const { agentInstanceId, input = {} } = await req.json();
  if (!agentInstanceId)
    return new NextResponse('Missing agentInstanceId', { status: 400 });

  const instance = await prisma.agentInstance.findUnique({
    where: { id: agentInstanceId },
    include: { template: true },
  });
  if (!instance)
    return new NextResponse('Agent instance not found', { status: 404 });

  // create run
  const run = await prisma.agentRun.create({
    data: {
      agentInstanceId: instance.id,
      userId: session.user.id,
      status: 'PENDING',
      input,
    },
  });

  // enqueue via the centralized producer (idempotent jobId -> runId)
  await enqueueRun({
    runId: run.id,
    agentInstanceId: instance.id,
    userId: session.user.id,
    input,
    requestId: undefined,
  });

  return NextResponse.json({ runId: run.id }, { status: 202 });
}
