import { PrismaClient } from '@prisma/client';

export async function seedCoreStaticData(prisma: PrismaClient) {
  console.log('🌱 Seeding core static data (Achievements, Agent Templates, etc.)...');

  // Seed Achievements
  await prisma.achievement.createMany({
    data: [
      { name: 'First Post', description: 'Created your first post!', icon: '🥇', category: 'CREATOR', requirements: { posts: 1 } },
      { name: 'GOAT', description: 'Greatest of All Time. No cap.', icon: '🐐', category: 'SPECIAL', requirements: { level: 50 } },
      { name: 'Vibe Check', description: 'Passed the ultimate vibe check.', icon: '🎵', category: 'SOCIAL', requirements: { interactions: 100 } },
      { name: 'Bussin\'', description: "Achievement so good, it's bussin'!", icon: '🔥', category: 'COMMUNITY', requirements: { likes: 50 } },
      { name: 'Community Pillar', description: 'Left over 50 comments.', icon: '🏛️', category: 'COMMUNITY', requirements: { comments: 50 } },
      { name: 'Detox Master', description: 'Completed a digital detox plan.', icon: '🏆', category: 'LEARNER', requirements: { wellnessSessions: 10 } },
      { name: 'Budget Pro', description: 'Created and maintained a budget for a month.', icon: '💰', category: 'LEARNER', requirements: { budgets: 1 } },
    ],
    skipDuplicates: true,
  });

  // Seed Agent Templates (all required fields)
  await prisma.agentTemplate.createMany({
    data: [
      { name: 'Researcher', description: 'Gathers and synthesizes information on any topic.', defaultPrompt: 'Research the given topic and summarize your findings.', defaultModel: 'gpt-4o', isPublic: true, version: 1 },
      { name: 'Content Writer', description: 'Generates various forms of written content.', defaultPrompt: 'Write engaging content for the given topic.', defaultModel: 'gpt-4o', isPublic: true, version: 1 },
      { name: 'Code Generator', description: 'Writes code snippets in various languages.', defaultPrompt: 'Generate code for the given requirements.', defaultModel: 'gpt-4o', isPublic: true, version: 1 },
      { name: 'Data Analyst', description: 'Analyzes data and generates insights.', defaultPrompt: 'Analyze the provided data and summarize insights.', defaultModel: 'claude-3-opus', isPublic: true, version: 1 },
    ],
    skipDuplicates: true,
  });

  console.log(`✅ Core static data seeded successfully.`);
} 