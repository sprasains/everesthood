import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

// GET all achievements and user's earned achievements
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    const userId = session?.user?.id;

    // Fetch all achievements
    const achievements = await prisma.achievement.findMany({
      orderBy: { createdAt: "asc" },
    });

    // Fetch user's earned achievements
    let userAchievements: string[] = [];
    if (userId) {
      const earned = await prisma.userAchievement.findMany({
        where: { userId },
        select: { achievementId: true },
      });
      userAchievements = earned.map((ua) => ua.achievementId);
    }

    return NextResponse.json({ achievements, userAchievements });
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to fetch achievements" },
      { status: 500 }
    );
  }
}
