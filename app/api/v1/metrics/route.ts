import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

// Get system-wide metrics
export async function GET(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id || session.user.role !== 'ADMIN')
    return new NextResponse('Unauthorized', { status: 401 });

  const url = new URL(req.url);
  const period = url.searchParams.get('period') || '24h'; // 24h, 7d, 30d

  // Calculate time range
  const now = new Date();
  const startDate = new Date(now);
  switch (period) {
    case '7d':
      startDate.setDate(now.getDate() - 7);
      break;
    case '30d':
      startDate.setDate(now.getDate() - 30);
      break;
    default: // 24h
      startDate.setHours(now.getHours() - 24);
  }

  // Collect various metrics
  const [
    totalUsers,
    newUsers,
    activeUsers,
    totalPosts,
    newPosts,
    totalComments,
    averageResponseTime,
  ] = await Promise.all([
    // Total users
    prisma.user.count(),
    // New users in period
    prisma.user.count({
      where: { createdAt: { gte: startDate } },
    }),
    // Active users in period
    prisma.userActivity
      .groupBy({
        by: ['userId'],
        where: { createdAt: { gte: startDate } },
      })
      .then((res: Array<{ userId: string }>) => res.length),
    // Total posts
    prisma.post.count(),
    // New posts in period
    prisma.post.count({
      where: { createdAt: { gte: startDate } },
    }),
    // Total comments
    prisma.comment.count(),
    // Average response time (ms) for API requests in period
    prisma.apiMetric.aggregate({
      where: { timestamp: { gte: startDate } },
      _avg: { responseTime: true },
    }),
  ]);

  // Return compiled metrics
  return NextResponse.json({
    timestamp: now.toISOString(),
    period,
    users: {
      total: totalUsers,
      new: newUsers,
      active: activeUsers,
    },
    content: {
      posts: {
        total: totalPosts,
        new: newPosts,
      },
      comments: {
        total: totalComments,
      },
    },
    performance: {
      averageResponseTime: averageResponseTime._avg.responseTime || 0,
    },
  });
}
