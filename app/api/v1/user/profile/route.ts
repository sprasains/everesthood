import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const id = searchParams.get('id');
  if (!id) return NextResponse.json({ error: 'Missing id' }, { status: 400 });

  // Fetch user core profile
  const user = await prisma.user.findUnique({
    where: { id },
    select: {
      id: true,
      name: true,
      email: true,
      profilePicture: true,
      xp: true,
      level: true,
      currentStreak: true,
      publicProfile: true,
      creatorBalance: true,
      bio: true,
      isAmbassador: true,
      role: true,
      createdAt: true,
      currentVibe: { select: { name: true, emoji: true } },
    }
  });
  if (!user) return NextResponse.json({ error: 'User not found' }, { status: 404 });

  // Fetch achievements
  const userAchievements = await prisma.userAchievement.findMany({
    where: { userId: id },
    include: { achievement: true },
  });
  const achievements = userAchievements.map(ua => ua.achievement);

  // Fetch badges
  const userBadges = await prisma.userBadge.findMany({
    where: { userId: id },
    include: { badge: true },
  });
  const badges = userBadges.map(ub => ub.badge);

  // Fetch recent mood logs
  const moodLogs = await prisma.moodLog.findMany({
    where: { userId: id },
    orderBy: { createdAt: 'desc' },
    take: 5,
    select: { mood: true, notes: true, createdAt: true },
  });

  return NextResponse.json({
    ...user,
    achievements,
    badges,
    recentMoodLogs: moodLogs,
  });
} 
