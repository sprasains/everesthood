import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

// POST /api/agents/[id]/runs/[runId]/stop - Stop a running agent
export async function POST(
  req: NextRequest,
  { params }: { params: { id: string; runId: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id, runId } = params;

    // Verify the run exists and belongs to the user
    const run = await prisma.agentRun.findFirst({
      where: {
        id: runId,
        agentInstanceId: id,
        userId: session.user.id
      }
    });

    if (!run) {
      return NextResponse.json(
        { error: 'Run not found' },
        { status: 404 }
      );
    }

    if (run.status !== 'RUNNING' && run.status !== 'PENDING') {
      return NextResponse.json(
        { error: 'Run is not running' },
        { status: 400 }
      );
    }

    // Update run status to cancelled
    await prisma.agentRun.update({
      where: { id: runId },
      data: {
        status: 'CANCELLED',
        completedAt: new Date(),
        error: 'Run cancelled by user'
      }
    });

    // Here you would typically also cancel the actual job in your queue system
    // For example: await cancelJob(runId);

    return NextResponse.json({ 
      message: 'Run stopped successfully' 
    });
  } catch (error) {
    console.error('Error stopping run:', error);
    return NextResponse.json(
      { error: 'Failed to stop run' },
      { status: 500 }
    );
  }
}

