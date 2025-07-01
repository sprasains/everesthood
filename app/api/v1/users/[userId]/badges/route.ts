import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { prisma } from '@/lib/prisma';

export async function GET(req: NextRequest, { params }: { params: { userId: string } }) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return new NextResponse("Unauthorized", { status: 401 });
  }
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