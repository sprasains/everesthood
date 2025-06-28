import { prisma } from "../src/lib/prisma";

async function main() {
  // Seed Achievements with Gen-Z slang
  const achievements = [
    { name: "Glow Up", description: "Fam, you had a major glow up!", icon: "✨", xpReward: 100 },
    { name: "GOAT", description: "Greatest of All Time. No cap.", icon: "🐐", xpReward: 200 },
    { name: "Vibe Check", description: "Passed the ultimate vibe check.", icon: "🎵", xpReward: 150 },
    { name: "Clapback King/Queen", description: "That clapback was fire!", icon: "👑", xpReward: 80 },
    { name: "Bussin'", description: "Achievement so good, it's bussin'!", icon: "🔥", xpReward: 120 },
  ];
  for (const ach of achievements) {
    await prisma.achievement.upsert({
      where: { name: ach.name },
      update: {},
      create: ach,
    });
  }

  // Seed Friends (Friendship) with Gen-Z names
  const users = await prisma.user.findMany({ take: 3 });
  if (users.length < 2) throw new Error("Need at least 2 users to seed friendships.");
  // Make user 0 and user 1 friends, and user 0 and user 2 friends
  await prisma.friendship.upsert({
    where: { requesterId_receiverId: { requesterId: users[0].id, receiverId: users[1].id } },
    update: {},
    create: { requesterId: users[0].id, receiverId: users[1].id, status: "ACCEPTED" },
  });
  await prisma.friendship.upsert({
    where: { requesterId_receiverId: { requesterId: users[0].id, receiverId: users[2].id } },
    update: {},
    create: { requesterId: users[0].id, receiverId: users[2].id, status: "ACCEPTED" },
  });

  // Seed UserAchievements for user 0
  const allAchievements = await prisma.achievement.findMany();
  for (const ach of allAchievements) {
    await prisma.userAchievement.upsert({
      where: { userId_achievementId: { userId: users[0].id, achievementId: ach.id } },
      update: {},
      create: { userId: users[0].id, achievementId: ach.id },
    });
  }

  console.log("Seeded Gen-Z achievements, friendships, and user achievements.");
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
