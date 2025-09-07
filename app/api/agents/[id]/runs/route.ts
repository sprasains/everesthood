import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

// GET /api/agents/[id]/runs - Get runs for an agent
export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;
    const { searchParams } = new URL(req.url);
    const limit = parseInt(searchParams.get('limit') || '50');
    const offset = parseInt(searchParams.get('offset') || '0');

    const runs = await prisma.agentRun.findMany({
      where: { agentInstanceId: id },
      include: {
        agentInstance: {
          include: {
            template: {
              select: { name: true }
            }
          }
        }
      },
      orderBy: { createdAt: 'desc' },
      take: limit,
      skip: offset
    });

    // Format runs for the frontend
    const formattedRuns = runs.map(run => ({
      id: run.id,
      agentId: run.agentInstanceId,
      agentName: run.agentInstance.template.name,
      status: run.status.toLowerCase(),
      progress: run.status === 'COMPLETED' ? 100 : run.status === 'FAILED' ? 0 : 50,
      startedAt: run.createdAt.toISOString(),
      completedAt: run.completedAt?.toISOString(),
      duration: run.duration,
      input: run.input,
      output: run.output,
      error: run.error,
      logs: [] // Placeholder - implement log fetching
    }));

    return NextResponse.json({ runs: formattedRuns });
  } catch (error) {
    console.error('Error fetching runs:', error);
    return NextResponse.json(
      { error: 'Failed to fetch runs' },
      { status: 500 }
    );
  }
}

// POST /api/agents/[id]/runs - Start a new run
export async function POST(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = params;
    const { input } = await req.json();

    if (!input) {
      return NextResponse.json(
        { error: 'Input is required' },
        { status: 400 }
      );
    }

    // Verify agent instance exists and user has access
    const agentInstance = await prisma.agentInstance.findFirst({
      where: {
        id,
        userId: session.user.id
      },
      include: {
        template: true
      }
    });

    if (!agentInstance) {
      return NextResponse.json(
        { error: 'Agent instance not found' },
        { status: 404 }
      );
    }

    // Create run record
    const run = await prisma.agentRun.create({
      data: {
        agentInstanceId: id,
        userId: session.user.id,
        status: 'PENDING',
        input,
        startedAt: new Date()
      }
    });

    // Enqueue the run (this would typically call your job queue)
    // For now, we'll simulate immediate processing
    setTimeout(async () => {
      try {
        await prisma.agentRun.update({
          where: { id: run.id },
          data: {
            status: 'RUNNING',
            progress: 0
          }
        });

        // Simulate processing
        for (let progress = 10; progress <= 100; progress += 10) {
          await new Promise(resolve => setTimeout(resolve, 1000));
          
          await prisma.agentRun.update({
            where: { id: run.id },
            data: { progress }
          });
        }

        // Complete the run
        await prisma.agentRun.update({
          where: { id: run.id },
          data: {
            status: 'COMPLETED',
            progress: 100,
            completedAt: new Date(),
            duration: 10000, // 10 seconds
            output: { result: 'Agent execution completed successfully' }
          }
        });
      } catch (error) {
        console.error('Error processing run:', error);
        await prisma.agentRun.update({
          where: { id: run.id },
          data: {
            status: 'FAILED',
            error: 'Agent execution failed',
            completedAt: new Date()
          }
        });
      }
    }, 100);

    return NextResponse.json({ 
      runId: run.id,
      message: 'Run started successfully' 
    }, { status: 202 });
  } catch (error) {
    console.error('Error starting run:', error);
    return NextResponse.json(
      { error: 'Failed to start run' },
      { status: 500 }
    );
  }
}