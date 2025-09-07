import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id)
    return new NextResponse('Unauthorized', { status: 401 });

  // Return progress stats for the user
  const progress = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: {
      xp: true,
      level: true,
      currentStreak: true,
      _count: {
        select: {
          achievements: true,
          badges: true,
          posts: true,
        },
      },
    },
  });

  if (!progress) return new NextResponse('User not found', { status: 404 });

  return NextResponse.json({
    ...progress,
    achievementCount: progress._count.achievements,
    badgeCount: progress._count.badges,
    postCount: progress._count.posts,
  });
}
