import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function GET(req: Request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || !session.user || !session.user.id) {
      return new NextResponse('Unauthorized', { status: 401 });
    }

    const userId = session.user.id;

    // Fetch agent runs with instance and template info
    const agentRuns = await prisma.agentRun.findMany({
      where: { userId },
      include: {
        agentInstance: {
          include: {
            template: true,
          },
        },
      },
      orderBy: { startedAt: 'desc' },
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
      if (run.status === 'COMPLETED' && run.startedAt && run.completedAt) {
        const duration = run.completedAt.getTime() - run.startedAt.getTime();
        totalDuration += duration;
        completedRunsWithDuration++;
      }
    });
    const averageRunTimeMs = completedRunsWithDuration > 0 ? totalDuration / completedRunsWithDuration : 0;
    const averageRunTimeSeconds = averageRunTimeMs / 1000;

    // Group by agent template
    const performanceByTemplate: { [key: string]: any } = {};
    agentRuns.forEach(run => {
      const template = run.agentInstance?.template;
      if (!template) return;
      const templateId = template.id;
      if (!performanceByTemplate[templateId]) {
        performanceByTemplate[templateId] = {
          templateId,
          templateName: template.name,
          total: 0,
          successful: 0,
          failed: 0,
          avgDurationMs: 0,
          completedWithDuration: 0,
        };
      }
      const t = performanceByTemplate[templateId];
      t.total++;
      if (run.status === 'COMPLETED') {
        t.successful++;
        if (run.startedAt && run.completedAt) {
          t.avgDurationMs += run.completedAt.getTime() - run.startedAt.getTime();
          t.completedWithDuration++;
        }
      } else if (run.status === 'FAILED') {
        t.failed++;
      }
    });
    // Finalize average duration
    for (const templateId in performanceByTemplate) {
      const t = performanceByTemplate[templateId];
      t.avgDurationMs = t.completedWithDuration > 0 ? t.avgDurationMs / t.completedWithDuration : 0;
    }

    return NextResponse.json({
      totalRuns,
      successfulRuns,
      failedRuns,
      awaitingInputRuns,
      successRate,
      averageRunTimeSeconds,
      performanceByTemplate,
    });
  } catch (error) {
    console.error('Error fetching agent performance data:', error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
}
