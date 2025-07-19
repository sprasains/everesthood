import { prisma } from "@/lib/prisma";
import { User } from "@prisma/client";

// Define achievement names or IDs to avoid magic strings
export const ACHIEVEMENT_NAMES = {
  FIRST_READ: "First Steps",
  TEN_READS: "Curious Reader",
  FIRST_POST: "Icebreaker",
  THREE_DAY_STREAK: "On Fire",
};

export async function awardAchievement(userId: string, achievementName: string) {
  const achievement = await prisma.achievement.findFirst({
    where: { name: achievementName },
  });
  if (!achievement) return;

  const existing = await prisma.userAchievement.findFirst({
    where: { 
      userId,
      achievementId: achievement.id 
    },
  });

  if (!existing) {
    await prisma.userAchievement.create({
      data: { userId, achievementId: achievement.id },
    });
    // Also award XP
    await prisma.user.update({
      where: { id: userId },
      data: { xp: { increment: achievement.xpReward } },
    });
    // Notify user of achievement
    await prisma.notification.create({
      data: {
        recipientId: userId,
        actorId: userId,
        type: 'ACHIEVEMENT',
        entityId: achievement.id,
      },
    });
    // Real-time notification via websockets should be handled in a server context where the Socket.IO server instance is available.
  }
}

export async function checkAndAwardAchievements(
  userId: string,
  updatedStats: any // fallback to any to bypass type error for dynamic fields
) {
  if (updatedStats["articlesRead"] && updatedStats["articlesRead"] === 1) {
    await awardAchievement(userId, ACHIEVEMENT_NAMES.FIRST_READ);
  }
  if (updatedStats["articlesRead"] && updatedStats["articlesRead"] === 10) {
    await awardAchievement(userId, ACHIEVEMENT_NAMES.TEN_READS);
  }
  if (updatedStats["streak"] && updatedStats["streak"] === 3) {
    await awardAchievement(userId, ACHIEVEMENT_NAMES.THREE_DAY_STREAK);
  }
  // Check for first post would be done in the post creation API
}
