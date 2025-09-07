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
    const category = url.searchParams.get('category');
    const earned = url.searchParams.get('earned') === 'true';

    const where: any = {
      isActive: true
    };

    if (category) {
      where.category = category;
    }

    const [achievements, userAchievements] = await Promise.all([
      prisma.achievement.findMany({
        where,
        orderBy: { points: 'desc' }
      }),
      prisma.userAchievement.findMany({
        where: { userId: session.user.id },
        include: {
          achievement: true
        }
      })
    ]);

    // Mark which achievements the user has earned
    const earnedAchievementIds = new Set(userAchievements.map(ua => ua.achievementId));
    
    const achievementsWithStatus = achievements.map(achievement => ({
      ...achievement,
      earned: earnedAchievementIds.has(achievement.id),
      earnedAt: userAchievements.find(ua => ua.achievementId === achievement.id)?.earnedAt,
      progress: userAchievements.find(ua => ua.achievementId === achievement.id)?.progress || 0
    }));

    // Filter by earned status if requested
    const filteredAchievements = earned 
      ? achievementsWithStatus.filter(a => a.earned)
      : achievementsWithStatus;

    return NextResponse.json({
      achievements: filteredAchievements,
      totalEarned: userAchievements.length,
      totalPoints: userAchievements.reduce((sum, ua) => sum + ua.achievement.points, 0)
    });

  } catch (error) {
    console.error('Error fetching achievements:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
