import { NextRequest, NextResponse } from "next/server";
import { prisma } from '@/lib/prisma';

export async function GET(req: NextRequest, { params }: { params: { userId: string } }) {
  const { userId } = params;
  const userBadges = await prisma.userBadge.findMany({
    where: { userId },
    include: { badge: true },
    orderBy: { earnedAt: "desc" },
  });
  return NextResponse.json({
    badges: userBadges.map(ub => ({
      name: ub.badge.name,
      description: ub.badge.description,
      imageUrl: ub.badge.imageUrl,
      earnedAt: ub.earnedAt,
    })),
  });
} 