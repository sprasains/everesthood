import { prisma } from "../src/lib/prisma";

const achievements = [
  {
    name: "First Article Read",
    type: "FIRST_ARTICLE_READ",
    description: "Read your first article!",
    icon: "📖",
    xpReward: 10,
    rarity: "common",
    category: "reading",
    requirements: { articlesRead: 1 },
  },
  {
    name: "10 Articles Read",
    type: "TEN_ARTICLES_READ",
    description: "Read 10 articles!",
    icon: "📚",
    xpReward: 25,
    rarity: "common",
    category: "reading",
    requirements: { articlesRead: 10 },
  },
  {
    name: "7-Day Streak",
    type: "SEVEN_DAY_STREAK",
    description: "Maintain a 7-day reading streak!",
    icon: "🔥",
    xpReward: 50,
    rarity: "rare",
    category: "streak",
    requirements: { streak: 7 },
  },
  // ...add at least 20 achievements here
];

async function main() {
  for (const ach of achievements) {
    await prisma.achievement.upsert({
      where: { type: ach.type },
      update: ach,
      create: ach,
    });
  }
  console.log("Achievements seeded!");
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
