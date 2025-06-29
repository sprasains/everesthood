import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/src/lib/prisma';

export async function POST() {
  const now = new Date();
  const lastMonth = new Date(now.getFullYear(), now.getMonth() - 1, now.getDate());

  // Find Top Tipper
  const topTipper = await prisma.tip.groupBy({
    by: ['tipperId'],
    where: { createdAt: { gte: lastMonth } },
    _sum: { amount: true },
    orderBy: { _sum: { amount: 'desc' } },
    take: 1,
  });
  // Find Top Creator
  const topCreator = await prisma.tip.groupBy({
    by: ['creatorId'],
    where: { createdAt: { gte: lastMonth } },
    _sum: { amount: true },
    orderBy: { _sum: { amount: 'desc' } },
    take: 1,
  });
  // Get badge IDs
  const topTipperBadge = await prisma.badge.findFirst({ where: { name: 'Top Tipper' } });
  const topCreatorBadge = await prisma.badge.findFirst({ where: { name: 'Top Creator' } });
  // Award badges if not already awarded for this period
  if (topTipper[0] && topTipperBadge) {
    await prisma.userBadge.upsert({
      where: { userId_badgeId: { userId: topTipper[0].tipperId, badgeId: topTipperBadge.id } },
      update: { earnedAt: now },
      create: { userId: topTipper[0].tipperId, badgeId: topTipperBadge.id, earnedAt: now },
    });
  }
  if (topCreator[0] && topCreatorBadge) {
    await prisma.userBadge.upsert({
      where: { userId_badgeId: { userId: topCreator[0].creatorId, badgeId: topCreatorBadge.id } },
      update: { earnedAt: now },
      create: { userId: topCreator[0].creatorId, badgeId: topCreatorBadge.id, earnedAt: now },
    });
  }
  return NextResponse.json({ success: true });
} 