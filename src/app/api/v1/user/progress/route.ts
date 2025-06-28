import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { awardAchievement, checkAndAwardAchievements } from "@/lib/achievements";

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { action, entityType, entityId, metadata } = body;

    // Update user stats based on action
    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
    });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    let updateData: any = {};
    let xpGain = 0;

    switch (action) {
      case "read_article":
        xpGain = 10;
        updateData.articlesRead = { increment: 1 };
        updateData.dailyProgress = { increment: 1 };
        break;
      case "use_summary":
        xpGain = 15;
        updateData.summariesUsed = { increment: 1 };
        break;
      case "share_content":
        xpGain = 20;
        updateData.sharesCount = { increment: 1 };
        break;
      default:
        xpGain = 5;
    }

    // Calculate new level
    const newXP = user.xp + xpGain;
    const newLevel = Math.floor(newXP / 100) + 1;
    const leveledUp = newLevel > user.level;

    updateData.xp = newXP;
    updateData.level = newLevel;

    // Update streak if applicable
    const today = new Date();
    const lastActive = user.lastActiveDate;

    if (!lastActive || lastActive.toDateString() !== today.toDateString()) {
      const yesterday = new Date(today);
      yesterday.setDate(yesterday.getDate() - 1);

      if (
        lastActive &&
        lastActive.toDateString() === yesterday.toDateString()
      ) {
        updateData.streak = { increment: 1 };
      } else {
        updateData.streak = 1;
      }
      updateData.lastActiveDate = today;
    }

    const updatedUser = await prisma.user.update({
      where: { id: user.id },
      data: updateData,
    });

    // Automatically check and award achievements
    await checkAndAwardAchievements(user.id, updatedUser);

    return NextResponse.json({
      user: updatedUser,
      xpGained: xpGain,
      leveledUp,
    });
  } catch (error) {
    console.error("Error updating user progress:", error);
    return NextResponse.json(
      { error: "Failed to update progress" },
      { status: 500 }
    );
  }
}
