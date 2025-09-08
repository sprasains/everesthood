import { PrismaClient, UserRole } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Seeding database with basic data...');

  // Clear existing data
  await prisma.user.deleteMany();
  await prisma.achievement.deleteMany();
  await prisma.agentTemplate.deleteMany();

  // Create basic achievements
  await prisma.achievement.createMany({
    data: [
      { name: 'First Post', description: 'Created your first post!', icon: '🥇', category: 'CREATOR', requirements: { posts: 1 } },
      { name: 'Community Builder', description: 'Active community member', icon: '🏛️', category: 'COMMUNITY', requirements: { comments: 10 } },
      { name: 'Learning Champion', description: 'Completed learning activities', icon: '🎓', category: 'LEARNER', requirements: { activities: 5 } },
    ],
  });

  // Create basic agent templates
  await prisma.agentTemplate.createMany({
    data: [
      { name: 'Researcher', description: 'Gathers and synthesizes information on any topic.', defaultPrompt: 'Research the given topic and summarize your findings.', defaultModel: 'gpt-4o', isPublic: true, version: 1 },
      { name: 'Content Writer', description: 'Generates various forms of written content.', defaultPrompt: 'Write engaging content for the given topic.', defaultModel: 'gpt-4o', isPublic: true, version: 1 },
      { name: 'Code Generator', description: 'Writes code snippets in various languages.', defaultPrompt: 'Generate code for the given requirements.', defaultModel: 'gpt-4o', isPublic: true, version: 1 },
    ],
  });

  // Create basic users
  await prisma.user.createMany({
    data: [
      { name: 'Admin User', email: 'admin@example.com', role: UserRole.SUPER_ADMIN },
      { name: 'Demo User', email: 'demo@everesthood.com', role: UserRole.USER },
      { name: 'Test User 1', email: 'test1@example.com', role: UserRole.USER },
      { name: 'Test User 2', email: 'test2@example.com', role: UserRole.USER },
    ],
  });

  console.log('✅ Database seeded successfully!');
}

main()
  .catch((e) => {
    console.error('Error seeding database:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
