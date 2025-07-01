import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(
  request: NextRequest,
  { params }: { params: { userId: string } }
) {
  const { userId } = params;

  if (!userId) {
    return NextResponse.json({ error: "User ID not provided" }, { status: 400 });
  }

  const userAchievements = await prisma.userAchievement.findMany({
    where: { userId: userId },
    include: {
      achievement: true,
    },
    orderBy: {
      earnedAt: 'desc',
    },
  });

  if (!userAchievements) {
    return NextResponse.json({ achievements: [] });
  }

  const achievements = userAchievements.map(ua => ua.achievement);

  return NextResponse.json({ achievements });
}
