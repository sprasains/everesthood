import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

const achievementsData = [
  // Engagement Achievements
  {
    name: "First Steps",
    description: "Read your first article.",
    icon: "&#128218;",
    xpReward: 25,
  },
  {
    name: "Curious Reader",
    description: "Read 10 articles.",
    icon: "&#128214;",
    xpReward: 100,
  },
  {
    name: "Bookworm",
    description: "Read 50 articles.",
    icon: "&#128215;",
    xpReward: 500,
  },
  {
    name: "AI Apprentice",
    description: "Use the AI summary feature for the first time.",
    icon: "&#129302;",
    xpReward: 50,
  },
  {
    name: "AI Adept",
    description: "Use the AI summary 25 times.",
    icon: "&#129302;✨",
    xpReward: 250,
  },
  // Streak Achievements
  {
    name: "On Fire",
    description: "Maintain a 3-day streak.",
    icon: "&#128293;",
    xpReward: 75,
  },
  {
    name: "Weekly Warrior",
    description: "Maintain a 7-day streak.",
    icon: "&#128170;",
    xpReward: 150,
  },
  {
    name: "Monthly Master",
    description: "Maintain a 30-day streak.",
    icon: "&#127941;",
    xpReward: 1000,
  },
  // Community Achievements
  {
    name: "Icebreaker",
    description: "Make your first post in the community.",
    icon: "&#128172;",
    xpReward: 50,
  },
  {
    name: "Social Butterfly",
    description: "Make 10 posts.",
    icon: "&#129419;",
    xpReward: 150,
  },
  {
    name: "Talk of the Town",
    description: "Receive 25 likes on your posts/comments.",
    icon: "&#127908;",
    xpReward: 200,
  },
  // Subscription Achievements
  {
    name: "Premium Member",
    description: "Upgrade to a Premium subscription.",
    icon: "&#128179;",
    xpReward: 300,
  },
];

async function seedAchievements() {
  console.log(`Start seeding achievements...`);
  for (const a of achievementsData) {
    const achievement = await prisma.achievement.create({
      data: a,
    });
    console.log(`Created achievement with id: ${achievement.id}`);
  }
  console.log(`Seeding finished.`);
}

export default seedAchievements;
