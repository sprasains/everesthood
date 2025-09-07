import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// GET /api/agent-marketplace/analytics - Get marketplace analytics
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const timeRange = searchParams.get('timeRange') || '30d';
    
    // Calculate date range
    const now = new Date();
    const daysBack = timeRange === '7d' ? 7 : timeRange === '30d' ? 30 : timeRange === '90d' ? 90 : 365;
    const startDate = new Date(now.getTime() - (daysBack * 24 * 60 * 60 * 1000));

    // Get basic metrics
    // Get average rating separately due to potential model absence
    let averageRating = { _avg: { rating: 0 } };
    try {
      averageRating = await prisma.agentReview.aggregate({
        _avg: { rating: true }
      });
    } catch (err) {
      // If the model does not exist, fallback to 0
      averageRating = { _avg: { rating: 0 } };
      // Document limitation
      console.warn('AgentReview model not found in schema. Ratings will be shown as 0.');
    }

    const [
      totalAgents,
      totalUsers,
      totalRuns,
      categoryDistribution,
      topCategories,
      topAgents,
      usageTrends,
      userEngagement,
      performanceMetrics
    ] = await Promise.all([
      // Total agents
      prisma.agentTemplate.count({
        where: { isPublic: true }
      }),

      // Total users
      prisma.user.count(),

      // Total runs
      prisma.agentRun.count({
        where: {
          createdAt: { gte: startDate }
        }
      }),

      // Category distribution
      prisma.agentTemplate.groupBy({
        by: ['category'],
        where: { isPublic: true },
        _count: { category: true }
      }),

      // Top categories
      prisma.agentTemplate.groupBy({
        by: ['category'],
        where: { isPublic: true },
        _count: { category: true },
        orderBy: { _count: { category: 'desc' } },
        take: 10
      }),

      // Top agents by usage
      prisma.agentInstance.findMany({
        include: {
          template: true,
          runs: {
            where: { createdAt: { gte: startDate } },
            select: { id: true }
          }
        },
        orderBy: { createdAt: 'desc' },
        take: 10
      }),

      // Usage trends (daily)
      getUsageTrends(startDate, daysBack),

      // User engagement
      getUserEngagement(startDate),

      // Performance metrics
      getPerformanceMetrics(startDate)
    ]);

    // Calculate growth rate (simplified)
    const previousPeriodStart = new Date(startDate.getTime() - (daysBack * 24 * 60 * 60 * 1000));
    const previousPeriodAgents = await prisma.agentTemplate.count({
      where: {
        isPublic: true,
        createdAt: {
          gte: previousPeriodStart,
          lt: startDate
        }
      }
    });

    const growthRate = previousPeriodAgents > 0 
      ? ((totalAgents - previousPeriodAgents) / previousPeriodAgents) * 100 
      : 0;

    // Format category distribution
    const categoryDistributionFormatted = categoryDistribution.map(cat => ({
      category: cat.category || 'Uncategorized',
      percentage: (cat._count.category / totalAgents) * 100,
      count: cat._count.category
    }));

    // Format top categories
    const topCategoriesFormatted = topCategories.map(cat => ({
      category: cat.category || 'Uncategorized',
      count: cat._count.category,
      growth: Math.random() * 20 - 10 // Placeholder - implement real growth calculation
    }));

    // Format top agents
    const topAgentsFormatted = topAgents.map(agent => ({
      id: agent.id,
      name: agent.template.name,
      runs: agent.runs.length,
      rating: 0, // Ratings unavailable due to missing AgentReview model
      growth: Math.random() * 20 - 10 // Placeholder
    }));

    const analytics = {
      totalAgents,
      totalUsers,
      totalRuns,
      averageRating: averageRating._avg.rating || 0, // Will be 0 if AgentReview is missing
      growthRate,
      topCategories: topCategoriesFormatted,
      topAgents: topAgentsFormatted,
      usageTrends,
      categoryDistribution: categoryDistributionFormatted,
      userEngagement,
      performanceMetrics
    };

    return NextResponse.json(analytics);
  } catch (error) {
    console.error('Error fetching analytics:', error);
    return NextResponse.json(
      { error: 'Failed to fetch analytics' },
      { status: 500 }
    );
  }
}

async function getUsageTrends(startDate: Date, daysBack: number) {
  const trends = [];
  
  for (let i = daysBack - 1; i >= 0; i--) {
    const date = new Date(startDate.getTime() + (i * 24 * 60 * 60 * 1000));
    const nextDate = new Date(date.getTime() + (24 * 60 * 60 * 1000));
    
    const [runs, users] = await Promise.all([
      prisma.agentRun.count({
        where: {
          createdAt: {
            gte: date,
            lt: nextDate
          }
        }
      }),
      prisma.agentRun.findMany({
        where: {
          createdAt: {
            gte: date,
            lt: nextDate
          }
        },
        select: { userId: true },
        distinct: ['userId']
      })
    ]);

    trends.push({
      date: date.toISOString().split('T')[0],
      runs,
      users: users.length
    });
  }

  return trends;
}

async function getUserEngagement(startDate: Date) {
  const now = new Date();
  const oneDayAgo = new Date(now.getTime() - (24 * 60 * 60 * 1000));
  const oneWeekAgo = new Date(now.getTime() - (7 * 24 * 60 * 60 * 1000));
  const oneMonthAgo = new Date(now.getTime() - (30 * 24 * 60 * 60 * 1000));

  const [dailyActive, weeklyActive, monthlyActive] = await Promise.all([
    prisma.agentRun.findMany({
      where: { createdAt: { gte: oneDayAgo } },
      select: { userId: true },
      distinct: ['userId']
    }),
    prisma.agentRun.findMany({
      where: { createdAt: { gte: oneWeekAgo } },
      select: { userId: true },
      distinct: ['userId']
    }),
    prisma.agentRun.findMany({
      where: { createdAt: { gte: oneMonthAgo } },
      select: { userId: true },
      distinct: ['userId']
    })
  ]);

  return {
    dailyActiveUsers: dailyActive.length,
    weeklyActiveUsers: weeklyActive.length,
    monthlyActiveUsers: monthlyActive.length,
    retentionRate: 85.5 // Placeholder - implement real retention calculation
  };
}

async function getPerformanceMetrics(startDate: Date) {
  const runs = await prisma.agentRun.findMany({
    where: { createdAt: { gte: startDate } },
    select: {
      status: true,
      duration: true,
      createdAt: true,
      completedAt: true
    }
  });

  const successfulRuns = runs.filter(run => run.status === 'COMPLETED');
  const failedRuns = runs.filter(run => run.status === 'FAILED');
  
  const averageExecutionTime = successfulRuns.length > 0
    ? successfulRuns.reduce((sum, run) => sum + (run.duration || 0), 0) / successfulRuns.length
    : 0;

  const successRate = runs.length > 0 ? (successfulRuns.length / runs.length) * 100 : 0;
  const errorRate = runs.length > 0 ? (failedRuns.length / runs.length) * 100 : 0;

  return {
    averageExecutionTime: averageExecutionTime / 1000, // Convert to seconds
    successRate,
    errorRate,
    satisfactionScore: 8.5 // Placeholder - implement real satisfaction calculation
  };
}

