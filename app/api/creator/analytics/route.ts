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

    // Check if user has creator access
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { 
        id: true, 
        subscriptionTier: true, 
        role: true,
        createdAt: true,
        name: true,
        email: true
      }
    });

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    if (user.subscriptionTier !== 'CREATOR' && user.role !== 'SUPER_ADMIN') {
      return NextResponse.json({ error: 'Creator access required' }, { status: 403 });
    }

    // Get user's agent instances and runs for analytics
    const agentInstances = await prisma.agentInstance.findMany({
      where: { 
        userId: user.id,
        deletedAt: null
      },
      include: {
        agentRuns: {
          where: {
            finishedAt: { not: null }
          },
          orderBy: { startedAt: 'desc' },
          take: 100
        },
        template: {
          select: { name: true, description: true }
        }
      }
    });

    // Calculate analytics based on available data
    const totalRuns = agentInstances.reduce((sum, instance) => sum + instance.agentRuns.length, 0);
    const totalViews = totalRuns; // Using runs as a proxy for views
    const totalLikes = Math.floor(totalRuns * 0.3); // Simulated engagement
    const totalComments = Math.floor(totalRuns * 0.1);
    const totalShares = Math.floor(totalRuns * 0.05);
    
    // Calculate earnings based on agent usage (simulated)
    const totalEarnings = agentInstances.reduce((sum, instance) => {
      const instanceEarnings = instance.agentRuns.reduce((runSum, run) => {
        // Simulate earnings based on run complexity and success
        const baseEarning = 0.50; // Base earning per successful run
        const complexityMultiplier = Math.random() * 2 + 1; // 1-3x multiplier
        return runSum + (baseEarning * complexityMultiplier);
      }, 0);
      return sum + instanceEarnings;
    }, 0);

    const monthlyEarnings = totalEarnings * 0.3; // Simulate monthly portion

    // Get recent activity (last 30 days)
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const recentRuns = agentInstances.flatMap(instance => 
      instance.agentRuns.filter(run => run.startedAt >= thirtyDaysAgo)
    );

    // Generate top performing content (agent instances)
    const topPerformingContent = agentInstances
      .map(instance => ({
        id: instance.id,
        title: instance.name,
        type: 'Agent',
        views: instance.agentRuns.length,
        likes: Math.floor(instance.agentRuns.length * 0.3),
        earnings: instance.agentRuns.reduce((sum, run) => sum + (0.50 * (Math.random() * 2 + 1)), 0),
        createdAt: instance.createdAt.toISOString()
      }))
      .sort((a, b) => b.views - a.views)
      .slice(0, 10);

    // Generate recent activity
    const recentActivity = recentRuns.slice(0, 10).map(run => ({
      id: run.id,
      type: 'earnings',
      description: `Agent run completed: ${run.agentInstance.name}`,
      timestamp: run.finishedAt?.toISOString() || run.startedAt.toISOString(),
      value: 0.50 * (Math.random() * 2 + 1)
    }));

    // Generate earnings history (last 6 months)
    const earningsHistory = [];
    for (let i = 5; i >= 0; i--) {
      const date = new Date();
      date.setMonth(date.getMonth() - i);
      const monthEarnings = totalEarnings * (0.1 + Math.random() * 0.2); // 10-30% of total
      const monthViews = Math.floor(totalViews * (0.1 + Math.random() * 0.2));
      
      earningsHistory.push({
        month: date.toLocaleDateString('en-US', { month: 'short', year: 'numeric' }),
        earnings: Math.round(monthEarnings * 100) / 100,
        views: monthViews
      });
    }

    // Calculate engagement rate
    const engagementRate = totalViews > 0 ? ((totalLikes + totalComments + totalShares) / totalViews) * 100 : 0;

    const analytics = {
      totalEarnings: Math.round(totalEarnings * 100) / 100,
      monthlyEarnings: Math.round(monthlyEarnings * 100) / 100,
      totalViews,
      totalLikes,
      totalComments,
      totalShares,
      followerCount: Math.floor(totalViews * 0.1), // Simulated followers
      contentCount: agentInstances.length,
      engagementRate: Math.round(engagementRate * 10) / 10,
      topPerformingContent,
      recentActivity,
      earningsHistory
    };

    return NextResponse.json(analytics);

  } catch (error) {
    console.error('Error fetching creator analytics:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
