import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import prisma from '@/lib/prisma';

export async function GET(req: Request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || !session.user || !session.user.id) {
      return new NextResponse('Unauthorized', { status: 401 });
    }

    const userId = session.user.id;

    const agentRuns = await prisma.agentRun.findMany({
      where: {
        userId: userId,
      },
      select: {
        status: true,
        createdAt: true,
        updatedAt: true,
        agentTemplateId: true,
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    // Calculate metrics
    const totalRuns = agentRuns.length;
    const successfulRuns = agentRuns.filter(run => run.status === 'COMPLETED').length;
    const failedRuns = agentRuns.filter(run => run.status === 'FAILED').length;
    const awaitingInputRuns = agentRuns.filter(run => run.status === 'AWAITING_INPUT').length;

    const successRate = totalRuns > 0 ? (successfulRuns / totalRuns) * 100 : 0;

    let totalDuration = 0;
    let completedRunsWithDuration = 0;

    agentRuns.forEach(run => {
      if (run.status === 'COMPLETED' && run.createdAt && run.updatedAt) {
        const duration = run.updatedAt.getTime() - run.createdAt.getTime(); // Duration in milliseconds
        totalDuration += duration;
        completedRunsWithDuration++;
      }
    });

    const averageRunTimeMs = completedRunsWithDuration > 0 ? totalDuration / completedRunsWithDuration : 0;
    const averageRunTimeSeconds = averageRunTimeMs / 1000;

    // Group by agent template for more granular data
    const performanceByAgent: { [key: string]: { total: number; successful: number; failed: number; avgDurationMs: number; } } = {};

    agentRuns.forEach(run => {
      if (!performanceByAgent[run.agentTemplateId]) {
        performanceByAgent[run.agentTemplateId] = { total: 0, successful: 0, failed: 0, avgDurationMs: 0 };
      }
      performanceByAgent[run.agentTemplateId].total++;
      if (run.status === 'COMPLETED') {
        performanceByAgent[run.agentTemplateId].successful++;
        if (run.createdAt && run.updatedAt) {
          const duration = run.updatedAt.getTime() - run.createdAt.getTime();
          performanceByAgent[run.agentTemplateId].avgDurationMs += duration;
        }
      } else if (run.status === 'FAILED') {
        performanceByAgent[run.agentTemplateId].failed++;
      }
    });

    // Calculate average duration for each agent template
    for (const templateId in performanceByAgent) {
      const agentData = performanceByAgent[templateId];
      if (agentData.successful > 0) {
        agentData.avgDurationMs /= agentData.successful;
      }
    }

    return NextResponse.json({
      totalRuns,
      successfulRuns,
      failedRuns,
      awaitingInputRuns,
      successRate,
      averageRunTimeSeconds,
      performanceByAgent,
    });
  } catch (error) {
    console.error('Error fetching agent performance data:', error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
}
