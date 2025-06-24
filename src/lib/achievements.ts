import { prisma } from "@/lib/prisma";

/**
 * Awards an achievement to a user if not already earned.
 * @param userId - The user's ID
 * @param achievementType - The unique type/key for the achievement (e.g., 'FIRST_ARTICLE_READ')
 */
export async function awardAchievement(
  userId: string,
  achievementType: string
) {
  // Find the achievement by type (assume 'type' is a unique field in the Achievement model)
  const achievement = await prisma.achievement.findUnique({
    where: { type: achievementType },
  });
  if (!achievement) return;
  // Check if already earned
  const alreadyEarned = await prisma.userAchievement.findUnique({
    where: { userId_achievementId: { userId, achievementId: achievement.id } },
  });
  if (!alreadyEarned) {
    await prisma.userAchievement.create({
      data: { userId, achievementId: achievement.id },
    });
  }
}
