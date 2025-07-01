import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

// GET all achievements and user's earned achievements
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    const userId = session?.user?.id;
    if (!userId) {
      return new NextResponse("Unauthorized", { status: 401 });
    }
    // Fetch all achievements
    const achievements = await prisma.achievement.findMany({
      orderBy: { xpReward: "asc" },
    });
    // Fetch user's earned achievements
    const userAchievements = await prisma.userAchievement.findMany({
      where: { userId },
      select: { achievementId: true, earnedAt: true },
    });

    // Fetch user stats for progress tracking
    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: { posts: true },
    });
    // For demo, mock articlesRead, summariesUsed, likesCount
    const articlesRead = (user as any)?.articlesRead || 0;
    const summariesUsed = (user as any)?.summariesUsed || 0;
    const postsCount = user?.posts?.length || 0;
    const streak = user?.streak || 0;
    // TODO: likesCount, etc.

    // Progress tracking logic
    const progressMap: Record<string, number> = {};
    for (const a of achievements) {
      if (a.name === "Curious Reader") {
        progressMap[a.id] = Math.min(articlesRead / 10, 1);
      } else if (a.name === "Bookworm") {
        progressMap[a.id] = Math.min(articlesRead / 50, 1);
      } else if (a.name === "AI Adept") {
        progressMap[a.id] = Math.min(summariesUsed / 25, 1);
      } else if (a.name === "On Fire") {
        progressMap[a.id] = Math.min(streak / 3, 1);
      } else if (a.name === "Weekly Warrior") {
        progressMap[a.id] = Math.min(streak / 7, 1);
      } else if (a.name === "Monthly Master") {
        progressMap[a.id] = Math.min(streak / 30, 1);
      } else if (a.name === "Social Butterfly") {
        progressMap[a.id] = Math.min(postsCount / 10, 1);
      } else if (a.name === "Talk of the Town") {
        progressMap[a.id] = 0;
      } else {
        progressMap[a.id] = 0;
      }
    }

    const earnedSet = new Set(userAchievements.map((ua) => ua.achievementId));
    const achievementsWithStatus = achievements.map((a) => ({
      ...a,
      earned: earnedSet.has(a.id),
      earnedAt:
        userAchievements.find((ua) => ua.achievementId === a.id)?.earnedAt ||
        null,
      progress: progressMap[a.id] || 0,
    }));
    return NextResponse.json(achievementsWithStatus);
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to fetch achievements" },
      { status: 500 }
    );
  }
}
