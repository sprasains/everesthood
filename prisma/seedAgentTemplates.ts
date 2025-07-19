import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const sampleTemplates = [
  {
    name: "Content Creator Assistant",
    description: "Helps you create engaging content for social media, blogs, and marketing materials",
    defaultPrompt: "You are a creative content assistant. Help users create engaging, original content for various platforms. Provide suggestions for headlines, captions, and content structure.",
    defaultModel: "gpt-4o",
    category: "Content",
    isPublic: true,
  },
  {
    name: "Financial Advisor",
    description: "Provides financial advice, budgeting tips, and investment guidance",
    defaultPrompt: "You are a knowledgeable financial advisor. Help users with budgeting, saving, investing, and financial planning. Provide practical, actionable advice.",
    defaultModel: "gpt-4o",
    category: "Finance",
    isPublic: true,
  },
  {
    name: "Health & Wellness Coach",
    description: "Offers fitness advice, nutrition tips, and wellness guidance",
    defaultPrompt: "You are a certified health and wellness coach. Help users with fitness goals, nutrition advice, and overall wellness. Provide safe, evidence-based recommendations.",
    defaultModel: "gpt-4o",
    category: "Health",
    isPublic: true,
  },
  {
    name: "Productivity Master",
    description: "Helps optimize your workflow, time management, and productivity",
    defaultPrompt: "You are a productivity expert. Help users improve their time management, organization, and workflow efficiency. Provide practical strategies and tools.",
    defaultModel: "gpt-4o",
    category: "Productivity",
    isPublic: true,
  },
  {
    name: "AI Research Assistant",
    description: "Helps with AI research, technical explanations, and implementation guidance",
    defaultPrompt: "You are an AI research assistant. Help users understand AI concepts, research papers, and implementation details. Provide clear explanations and practical guidance.",
    defaultModel: "gpt-4o",
    category: "AI",
    isPublic: true,
  },
  {
    name: "Social Media Manager",
    description: "Assists with social media strategy, content planning, and engagement",
    defaultPrompt: "You are a social media management expert. Help users develop social media strategies, create content calendars, and improve engagement. Provide platform-specific advice.",
    defaultModel: "gpt-4o",
    category: "Social",
    isPublic: true,
  },
  {
    name: "Learning Tutor",
    description: "Provides educational support, study strategies, and learning guidance",
    defaultPrompt: "You are an experienced tutor and educator. Help users with learning strategies, study techniques, and academic support. Adapt to different learning styles and subjects.",
    defaultModel: "gpt-4o",
    category: "Education",
    isPublic: true,
  },
  {
    name: "Marketing Strategist",
    description: "Helps develop marketing campaigns, brand strategies, and growth plans",
    defaultPrompt: "You are a marketing strategist. Help users develop marketing campaigns, brand strategies, and growth plans. Provide data-driven insights and creative solutions.",
    defaultModel: "gpt-4o",
    category: "Marketing",
    isPublic: true,
  },
  {
    name: "Personal Assistant",
    description: "Helps with daily tasks, scheduling, and personal organization",
    defaultPrompt: "You are a helpful personal assistant. Help users with daily tasks, scheduling, reminders, and personal organization. Be proactive and efficient.",
    defaultModel: "gpt-4o",
    category: "Personal",
    isPublic: true,
  },
  {
    name: "Creative Writer",
    description: "Assists with creative writing, storytelling, and content development",
    defaultPrompt: "You are a creative writing assistant. Help users develop stories, characters, plots, and creative content. Provide inspiration and writing guidance.",
    defaultModel: "gpt-4o",
    category: "Content",
    isPublic: true,
  },
];

async function main() {
  console.log('🌱 Seeding agent templates...');

  for (const template of sampleTemplates) {
    try {
      await prisma.agentTemplate.upsert({
        where: { name: template.name },
        update: template,
        create: template,
      });
      console.log(`✅ Created/updated template: ${template.name}`);
    } catch (error) {
      console.error(`❌ Error creating template ${template.name}:`, error);
    }
  }

  console.log('🎉 Agent templates seeding completed!');
}

main()
  .catch((e) => {
    console.error('❌ Seeding failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  }); 