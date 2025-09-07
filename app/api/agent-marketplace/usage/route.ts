import { NextResponse } from 'next/server';
import { prisma } from '../../../../lib/prisma';
import { NextRequest } from 'next/server';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const userId = searchParams.get('userId');
    const timeRange = searchParams.get('timeRange') || '7d';
    const agentId = searchParams.get('agentId') || 'all';
    
    // Calculate date range
    const now = new Date();
    const daysBack = timeRange === '24h' ? 1 : timeRange === '7d' ? 7 : timeRange === '30d' ? 30 : 90;
    const startDate = new Date(now.getTime() - (daysBack * 24 * 60 * 60 * 1000));

    // Build where clause
    const whereClause: any = {
      createdAt: { gte: startDate }
    };

    if (agentId !== 'all') {
      whereClause.agentInstanceId = agentId;
    }

    if (userId) {
      whereClause.userId = userId;
    }

    // Get performance metrics
    const [
      totalRuns,
      successfulRuns,
      failedRuns,
      averageDuration,
      topPerformers,
      recentActivity,
      usageTrends
    ] = await Promise.all([
      // Total runs
      prisma.agentRun.count({ where: whereClause }),
      
      // Successful runs
      prisma.agentRun.count({ 
        where: { ...whereClause, status: 'COMPLETED' } 
      }),
      
      // Failed runs
      prisma.agentRun.count({ 
        where: { ...whereClause, status: 'FAILED' } 
      }),
      
      // Average duration
      prisma.agentRun.aggregate({
        where: { ...whereClause, status: 'COMPLETED' },
        _avg: { duration: true }
      }),
      
      // Top performers
      prisma.agentInstance.findMany({
        where: userId ? { userId } : {},
        include: {
          template: { select: { name: true } },
          runs: {
            where: { createdAt: { gte: startDate } },
            select: { id: true, status: true, duration: true }
          }
        },
        take: 10
      }),
      
      // Recent activity
      prisma.agentRun.findMany({
        where: whereClause,
        include: {
          agentInstance: {
            include: {
              template: { select: { name: true } }
            }
          }
        },
        orderBy: { createdAt: 'desc' },
        take: 20
      }),
      
      // Usage trends
      getUsageTrends(startDate, daysBack, userId, agentId)
    ]);

    // Calculate metrics
    const successRate = totalRuns > 0 ? (successfulRuns / totalRuns) * 100 : 0;
    const errorRate = totalRuns > 0 ? (failedRuns / totalRuns) * 100 : 0;
    const avgExecutionTime = averageDuration._avg.duration || 0;

    // Format top performers
    const topPerformersFormatted = topPerformers.map(agent => {
      const runs = agent.runs;
      const successfulRuns = runs.filter(run => run.status === 'COMPLETED').length;
      const successRate = runs.length > 0 ? (successfulRuns / runs.length) * 100 : 0;
      const avgDuration = runs.length > 0 
        ? runs.reduce((sum, run) => sum + (run.duration || 0), 0) / runs.length 
        : 0;

      return {
        agentId: agent.id,
        name: agent.template.name,
        totalRuns: runs.length,
        successRate,
        avgExecutionTime: avgDuration / 1000, // Convert to seconds
        lastRun: runs.length > 0 ? runs[0].createdAt : null,
        status: runs.length > 0 ? 'active' : 'idle'
      };
    });

    // Format recent activity
    const recentActivityFormatted = recentActivity.map(run => ({
      id: run.id,
      agentName: run.agentInstance.template.name,
      status: run.status.toLowerCase(),
      startedAt: run.startedAt,
      completedAt: run.completedAt,
      duration: run.duration
    }));

    const metrics = {
      totalAgents: topPerformers.length,
      activeAgents: topPerformers.filter(agent => agent.runs.length > 0).length,
      totalRuns,
      successRate,
      avgExecutionTime: avgExecutionTime / 1000, // Convert to seconds
      topPerformers: topPerformersFormatted,
      recentActivity: recentActivityFormatted,
      usageTrends
    };

    return NextResponse.json(metrics);
  } catch (error) {
    console.error('Error fetching usage metrics:', error);
    return NextResponse.json(
      { error: 'Failed to fetch usage metrics' },
      { status: 500 }
    );
  }
}

async function getUsageTrends(startDate: Date, daysBack: number, userId?: string | null, agentId?: string | null) {
  const trends = [];
  
  for (let i = daysBack - 1; i >= 0; i--) {
    const date = new Date(startDate.getTime() + (i * 24 * 60 * 60 * 1000));
    const nextDate = new Date(date.getTime() + (24 * 60 * 60 * 1000));
    
    const whereClause: any = {
      createdAt: {
        gte: date,
        lt: nextDate
      }
    };

    if (userId) {
      whereClause.userId = userId;
    }

    if (agentId && agentId !== 'all') {
      whereClause.agentInstanceId = agentId;
    }

    const runs = await prisma.agentRun.count({
      where: whereClause
    });

    trends.push({
      date: date.toISOString().split('T')[0],
      runs
    });
  }

  return trends;
}
