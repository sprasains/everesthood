import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const url = new URL(request.url);
    const period = url.searchParams.get('period') || '7d'; // 7d, 30d, 90d, 1y

    // Calculate date range based on period
    const now = new Date();
    let startDate: Date;
    
    switch (period) {
      case '7d':
        startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        break;
      case '30d':
        startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
        break;
      case '90d':
        startDate = new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000);
        break;
      case '1y':
        startDate = new Date(now.getTime() - 365 * 24 * 60 * 60 * 1000);
        break;
      default:
        startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    }

    // Fetch comprehensive dashboard data
    const [
      user,
      recentActivity,
      agentStats,
      healthStats,
      financialStats,
      shoppingStats,
      productivityStats,
      notifications,
      upcomingEvents,
      achievements
    ] = await Promise.all([
      // User profile data
      prisma.user.findUnique({
        where: { id: session.user.id },
        select: {
          id: true,
          name: true,
          email: true,
          image: true,
          level: true,
          xp: true,
          subscriptionTier: true,
          createdAt: true
        }
      }),

      // Recent activity
      prisma.userActivity.findMany({
        where: {
          userId: session.user.id,
          createdAt: { gte: startDate }
        },
        orderBy: { createdAt: 'desc' },
        take: 10
      }),

      // Agent statistics
      prisma.agentInstance.findMany({
        where: { userId: session.user.id },
        include: {
          _count: {
            select: { runs: true }
          },
          runs: {
            where: { createdAt: { gte: startDate } },
            select: {
              status: true,
              createdAt: true
            }
          }
        }
      }),

      // Health statistics
      prisma.healthMetric.findMany({
        where: {
          userId: session.user.id,
          date: { gte: startDate }
        },
        orderBy: { date: 'desc' }
      }),

      // Financial statistics
      prisma.transaction.findMany({
        where: {
          userId: session.user.id,
          date: { gte: startDate }
        },
        orderBy: { date: 'desc' }
      }),

      // Shopping statistics
      prisma.cartItem.findMany({
        where: { userId: session.user.id },
        include: { product: true }
      }),

      // Productivity statistics
      prisma.task.findMany({
        where: {
          userId: session.user.id,
          createdAt: { gte: startDate }
        },
        orderBy: { createdAt: 'desc' }
      }),

      // Recent notifications
      prisma.notification.findMany({
        where: {
          userId: session.user.id,
          isRead: false
        },
        orderBy: { createdAt: 'desc' },
        take: 5
      }),

      // Upcoming events (from schedule)
      prisma.event.findMany({
        where: {
          attendees: {
            some: { userId: session.user.id }
          },
          startTime: { gte: now }
        },
        orderBy: { startTime: 'asc' },
        take: 5
      }),

      // Recent achievements
      prisma.userAchievement.findMany({
        where: { userId: session.user.id },
        include: { achievement: true },
        orderBy: { earnedAt: 'desc' },
        take: 5
      })
    ]);

    // Calculate insights and statistics
    const agentInsights = {
      totalAgents: agentStats.length,
      totalRuns: agentStats.reduce((sum, agent) => sum + agent._count.runs, 0),
      successfulRuns: agentStats.reduce((sum, agent) => 
        sum + agent.runs.filter(run => run.status === 'COMPLETED').length, 0
      ),
      recentRuns: agentStats.reduce((sum, agent) => sum + agent.runs.length, 0)
    };

    const healthInsights = {
      totalMetrics: healthStats.length,
      categories: [...new Set(healthStats.map(h => h.category))],
      latestMetric: healthStats[0] || null,
      averageValue: healthStats.length > 0 
        ? healthStats.reduce((sum, h) => sum + h.value, 0) / healthStats.length 
        : 0
    };

    const financialInsights = {
      totalTransactions: financialStats.length,
      totalIncome: financialStats
        .filter(t => t.type === 'income')
        .reduce((sum, t) => sum + t.amount, 0),
      totalExpenses: financialStats
        .filter(t => t.type === 'expense')
        .reduce((sum, t) => sum + t.amount, 0),
      netIncome: 0, // Will be calculated below
      categories: [...new Set(financialStats.map(t => t.category))]
    };
    financialInsights.netIncome = financialInsights.totalIncome - financialInsights.totalExpenses;

    const shoppingInsights = {
      cartItems: shoppingStats.length,
      cartTotal: shoppingStats.reduce((sum, item) => sum + (item.product.price * item.quantity), 0),
      categories: [...new Set(shoppingStats.map(item => item.product.category))]
    };

    const productivityInsights = {
      totalTasks: productivityStats.length,
      completedTasks: productivityStats.filter(t => t.isCompleted).length,
      pendingTasks: productivityStats.filter(t => !t.isCompleted).length,
      completionRate: productivityStats.length > 0 
        ? (productivityStats.filter(t => t.isCompleted).length / productivityStats.length) * 100 
        : 0
    };

    // Calculate trends (comparing with previous period)
    const previousStartDate = new Date(startDate.getTime() - (now.getTime() - startDate.getTime()));
    
    const [previousAgentRuns, previousTasks, previousTransactions] = await Promise.all([
      prisma.agentRun.count({
        where: {
          agentInstance: { userId: session.user.id },
          createdAt: { gte: previousStartDate, lt: startDate }
        }
      }),
      prisma.task.count({
        where: {
          userId: session.user.id,
          createdAt: { gte: previousStartDate, lt: startDate }
        }
      }),
      prisma.transaction.count({
        where: {
          userId: session.user.id,
          date: { gte: previousStartDate, lt: startDate }
        }
      })
    ]);

    const trends = {
      agentRuns: {
        current: agentInsights.recentRuns,
        previous: previousAgentRuns,
        change: previousAgentRuns > 0 
          ? ((agentInsights.recentRuns - previousAgentRuns) / previousAgentRuns) * 100 
          : 0
      },
      tasks: {
        current: productivityInsights.totalTasks,
        previous: previousTasks,
        change: previousTasks > 0 
          ? ((productivityInsights.totalTasks - previousTasks) / previousTasks) * 100 
          : 0
      },
      transactions: {
        current: financialInsights.totalTransactions,
        previous: previousTransactions,
        change: previousTransactions > 0 
          ? ((financialInsights.totalTransactions - previousTransactions) / previousTransactions) * 100 
          : 0
      }
    };

    return NextResponse.json({
      user,
      period,
      insights: {
        agents: agentInsights,
        health: healthInsights,
        financial: financialInsights,
        shopping: shoppingInsights,
        productivity: productivityInsights
      },
      trends,
      recent: {
        activity: recentActivity,
        notifications,
        upcomingEvents,
        achievements
      },
      summary: {
        totalModules: 8, // Money, Health, Shopping, Schedule, Family, Docs, Hub, Agents
        activeModules: [
          agentInsights.totalAgents > 0 ? 'Agents' : null,
          healthInsights.totalMetrics > 0 ? 'Health' : null,
          financialInsights.totalTransactions > 0 ? 'Money' : null,
          shoppingInsights.cartItems > 0 ? 'Shopping' : null,
          productivityInsights.totalTasks > 0 ? 'Productivity' : null
        ].filter(Boolean),
        xpProgress: user?.xp || 0,
        level: user?.level || 1
      }
    });

  } catch (error) {
    console.error('Error fetching dashboard data:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
