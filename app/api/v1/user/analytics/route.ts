import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id)
    return new NextResponse('Unauthorized', { status: 401 });

  // Get last 7 days of activity
  const sevenDaysAgo = new Date();
  sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

  const activity = await prisma.userActivity.findMany({
    where: {
      userId: session.user.id,
      createdAt: { gte: sevenDaysAgo },
    },
    orderBy: { createdAt: 'asc' },
  });

  // Get basic user stats
  const stats = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: {
      xp: true,
      level: true,
      currentStreak: true,
      articlesRead: true,
    },
  });

  return NextResponse.json({
    activity,
    stats,
  });
}
