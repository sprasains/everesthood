import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session || !session.user || !session.user.id) {
    return new NextResponse('Unauthorized', { status: 401 });
  }
  const userId = session.user.id;

  // Get all achievements
  const achievements = await prisma.achievement.findMany();

  // Get user's earned achievements (with achievedAt)
  const userAchievements = await prisma.userAchievement.findMany({
    where: { userId },
    select: { achievementId: true, achievedAt: true }
  });
  const earnedMap = new Map(userAchievements.map(a => [a.achievementId, a.achievedAt]));

  const result = achievements.map(a => ({
    ...a,
    earned: earnedMap.has(a.id),
    achievedAt: earnedMap.get(a.id) || null,
  }));
  return NextResponse.json(result);
} 
