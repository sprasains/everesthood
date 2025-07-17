import { PrismaClient, User, Mood, GuideCategory, JournalPromptCategory, AgentRunStatus } from '@prisma/client';
import { faker } from '@faker-js/faker';

export async function seedFeatures(prisma: PrismaClient, allUsers: User[]) {
  console.log('🚀 Seeding rich data for EverestHood and AgentForge features...');

  // --- Create Families and link users ---
  const families = [];
  for (let i = 0; i < 30; i++) {
    const family = await prisma.family.create({
      data: { name: `${faker.person.lastName()} Family` }
    });
    families.push(family);
  }
  const usersToFamily = allUsers.filter(u => u.role !== 'ADMIN');
  for (const user of usersToFamily) {
    const family = faker.helpers.arrayElement(families);
    await prisma.user.update({
      where: { id: user.id },
      data: { familyId: family.id },
    });
  }
  console.log(`✅ Created ${families.length} families and assigned users.`);

  // --- Create Family Events ---
  for (const family of families) {
    const familyMembers = await prisma.user.findMany({ where: { familyId: family.id } });
    if (familyMembers.length === 0) continue;
    for (let i = 0; i < faker.number.int({ min: 5, max: 20 }); i++) {
      const creator = faker.helpers.arrayElement(familyMembers);
      await prisma.event.create({
        data: {
          familyId: family.id,
          createdById: creator.id,
          title: faker.lorem.words(3),
          description: faker.lorem.sentence(),
          startTime: faker.date.soon({ days: 60 }),
          endTime: faker.date.soon({ days: 60, refDate: new Date(Date.now() + 2 * 3600 * 1000) }),
        }
      });
    }
  }
  console.log(`✅ Created hundreds of family events.`);

  // --- Create Budgets and Transactions ---
  for (const user of allUsers) {
    const budget = await prisma.budget.create({
      data: { userId: user.id, name: 'Monthly Expenses', limitAmount: faker.number.int({ min: 2000, max: 8000 }), category: 'General' }
    });
    for (let i = 0; i < faker.number.int({ min: 50, max: 200 }); i++) {
      await prisma.transaction.create({
        data: {
          userId: user.id,
          budgetId: budget.id,
          amount: faker.number.float({ min: -1000, max: 200, fractionDigits: 2 }),
          description: faker.commerce.productName(),
          date: faker.date.recent({ days: 90 }),
        }
      });
    }
  }
  console.log(`✅ Created budgets and thousands of transactions for all users.`);

  // --- Create Agent Instances and Runs ---
  const agentTemplates = await prisma.agentTemplate.findMany();
  if (agentTemplates.length > 0) {
    for (const user of allUsers) {
      if (Math.random() < 0.8) { // 80% of users get agents
        const instance = await prisma.agentInstance.create({
          data: {
            name: `${faker.word.adjective()} Bot for ${user.name?.split(' ')[0]}`,
            templateId: faker.helpers.arrayElement(agentTemplates).id,
            userId: user.id,
            configOverride: { customPrompt: `A special prompt for ${user.name}` },
          },
        });
        for (let j = 0; j < faker.number.int({ min: 10, max: 100 }); j++) {
          await prisma.agentRun.create({
            data: {
              agentInstanceId: instance.id,
              userId: user.id,
              status: faker.helpers.arrayElement([AgentRunStatus.COMPLETED, AgentRunStatus.FAILED]),
              input: { query: faker.hacker.phrase() },
              output: { result: faker.lorem.paragraph() },
              startedAt: faker.date.recent({ days: 30 }),
            }
          });
        }
      }
    }
  }
  console.log(`✅ Created hundreds of agent instances and thousands of run logs.`);

  // --- Seed Guides ---
  await prisma.guide.createMany({
    data: [
      { title: "Investing 101: A Beginner's Guide", slug: "investing-101", shortDescription: "Learn the basics of investing.", coverImageUrl: "/images/guides/investing.jpg", category: "FINANCE", content: faker.lorem.paragraphs(12), author: "Casey Jordan", publishedAt: new Date() },
      { title: "Networking Tips for Introverts", slug: "networking-for-introverts", shortDescription: "Build professional connections.", coverImageUrl: "/images/guides/networking.jpg", category: "CAREER", content: faker.lorem.paragraphs(8), author: "Morgan Smith", publishedAt: new Date() },
    ],
    skipDuplicates: true,
  });

  // --- Seed Moods & Journal Entries ---
  for (const user of allUsers) {
      for (let i = 0; i < faker.number.int({ min: 15, max: 60 }); i++) {
          await prisma.moodLog.create({
              data: {
                  userId: user.id,
                  mood: faker.helpers.arrayElement([Mood.GREAT, Mood.GOOD, Mood.MEH, Mood.BAD, Mood.AWFUL]),
                  notes: faker.lorem.sentence(),
                  createdAt: faker.date.recent({ days: 90 }),
              }
          });
      }
  }
   console.log(`✅ Seeded mood logs for all users.`);
} 