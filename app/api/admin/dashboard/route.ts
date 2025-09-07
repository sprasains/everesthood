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

    // Check if user is admin
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { role: true }
    });

    if (!user || user.role !== 'SUPER_ADMIN') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    // Get dashboard statistics
    const [
      totalUsers,
      totalAgents,
      totalPosts,
      totalJobs,
      totalSummaries,
      totalWellnessSessions,
      recentUsers,
      recentAgents,
      recentPosts,
      systemStats
    ] = await Promise.all([
      prisma.user.count({
        where: { deletedAt: null }
      }),
      prisma.agentTemplate.count({
        where: { deletedAt: null }
      }),
      prisma.post.count({
        where: { deletedAt: null }
      }),
      prisma.job.count({
        where: { isActive: true }
      }),
      prisma.aISummary.count({
        where: { deletedAt: null }
      }),
      prisma.wellnessSession.count(),
      prisma.user.findMany({
        where: { deletedAt: null },
        orderBy: { createdAt: 'desc' },
        take: 5,
        select: {
          id: true,
          name: true,
          email: true,
          role: true,
          createdAt: true,
        }
      }),
      prisma.agentTemplate.findMany({
        where: { deletedAt: null },
        orderBy: { createdAt: 'desc' },
        take: 5,
        select: {
          id: true,
          name: true,
          description: true,
          isPublic: true,
          createdAt: true,
        }
      }),
      prisma.post.findMany({
        where: { deletedAt: null },
        orderBy: { createdAt: 'desc' },
        take: 5,
        include: {
          user: {
            select: { id: true, name: true }
          }
        }
      }),
      prisma.usageMeter.groupBy({
        by: ['model'],
        _sum: { count: true },
        where: {
          periodStart: {
            gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) // Last 30 days
          }
        }
      })
    ]);

    // Calculate growth metrics
    const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
    const [usersLast30Days, agentsLast30Days, postsLast30Days] = await Promise.all([
      prisma.user.count({
        where: {
          createdAt: { gte: thirtyDaysAgo },
          deletedAt: null
        }
      }),
      prisma.agentTemplate.count({
        where: {
          createdAt: { gte: thirtyDaysAgo },
          deletedAt: null
        }
      }),
      prisma.post.count({
        where: {
          createdAt: { gte: thirtyDaysAgo },
          deletedAt: null
        }
      })
    ]);

    return NextResponse.json({
      stats: {
        totalUsers,
        totalAgents,
        totalPosts,
        totalJobs,
        totalSummaries,
        totalWellnessSessions,
        growth: {
          users: usersLast30Days,
          agents: agentsLast30Days,
          posts: postsLast30Days,
        }
      },
      recent: {
        users: recentUsers,
        agents: recentAgents,
        posts: recentPosts,
      },
      system: {
        usageByModel: systemStats,
      }
    });

  } catch (error) {
    console.error('Error fetching admin dashboard data:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
