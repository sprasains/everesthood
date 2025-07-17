import { PrismaClient } from '@prisma/client';

export async function seedCoreStaticData(prisma: PrismaClient) {
  console.log('🌱 Seeding core static data (Vibes, Achievements, Badges, etc.)...');

  // Seed Vibes
  await prisma.vibe.createMany({
    data: [
      { name: 'Vibing', emoji: '✌️' }, { name: 'In my healing era', emoji: '🌿' },
      { name: 'On my grind', emoji: '💼' }, { name: 'Feeling ✨aesthetic✨', emoji: '🌸' },
      { name: 'Lowkey thriving', emoji: '😌' }, { name: 'In my villain era', emoji: '😈' },
      { name: 'Bored in the house', emoji: '🏠' }, { name: 'Big sad', emoji: '🥲' },
    ],
    skipDuplicates: true,
  });

  // Seed Achievements
  await prisma.achievement.createMany({
    data: [
      { name: 'First Post', description: 'Created your first post!', icon: '🥇', xpReward: 100 },
      { name: 'GOAT', description: 'Greatest of All Time. No cap.', icon: '🐐', xpReward: 200 },
      { name: 'Vibe Check', description: 'Passed the ultimate vibe check.', icon: '🎵', xpReward: 150 },
      { name: 'Bussin\'', description: "Achievement so good, it's bussin'!", icon: '🔥', xpReward: 120 },
      { name: 'Community Pillar', description: 'Left over 50 comments.', icon: '🏛️', xpReward: 250 },
      { name: 'Detox Master', description: 'Completed a digital detox plan.', icon: '🏆', xpReward: 50 },
      { name: 'Budget Pro', description: 'Created and maintained a budget for a month.', icon: '💰', xpReward: 150 },
    ],
    skipDuplicates: true,
  });

  // Seed Badges
  await prisma.badge.createMany({
    data: [
      { name: 'Top Tipper', description: 'Awarded for generous tipping.', imageUrl: '/badges/tipper.png' },
      { name: 'Top Creator', description: 'Awarded for receiving significant tips.', imageUrl: '/badges/creator.png' },
      { name: 'Early Adopter', description: 'Joined during the first month.', imageUrl: '/badges/early.png' },
      { name: 'Beta Tester', description: 'Helped test new features before launch.', imageUrl: '/badges/beta.png' },
    ],
    skipDuplicates: true,
  });

  // Seed Tools
  await prisma.tool.createMany({
    data: [
      { name: 'web_search', description: 'Performs a web search to find up-to-date information.', inputSchema: { "query": "string" } },
      { name: 'runAgentTool', description: 'Runs another agent as a tool within a workflow.', inputSchema: { "agentInstanceId": "string", "input": "object" } },
      { name: 'calculator', description: 'Performs mathematical calculations.', inputSchema: { "expression": "string" } },
      { name: 'database_query', description: 'Queries the application database for information.', inputSchema: { "query": "string" } },
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

  // Seed Journal Prompts
  await prisma.journalPrompt.createMany({
    data: [
      { promptText: "What are three things you're grateful for today?", category: "GRATITUDE" },
      { promptText: "What challenged you today, and how did you respond?", category: "REFLECTION" },
      { promptText: "What is one goal you want to focus on tomorrow?", category: "GOAL_SETTING" },
      { promptText: "Describe a moment you felt proud of yourself this week.", category: "REFLECTION" },
    ],
    skipDuplicates: true,
  });

  // Seed Productivity Tips
  await prisma.productivityTip.createMany({
    data: [
      { text: "Vibe check: You're crushing it. Keep going." }, { text: "Main character energy only. Make your move." },
      { text: "Progress, not perfection." }, { text: "That task isn't gonna complete itself. Bet." },
    ],
    skipDuplicates: true,
  });

  console.log(`✅ Core static data seeded successfully.`);
} 