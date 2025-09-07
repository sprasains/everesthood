import { PrismaClient } from '@prisma/client';

const { prisma } = require('../lib/prisma');

const sampleTemplates = [
  {
    name: 'Content Creator Assistant',
    description:
      'Helps you create engaging content for social media, blogs, and marketing materials',
    defaultPrompt:
      'You are a creative content assistant. Help users create engaging, original content for various platforms. Provide suggestions for headlines, captions, and content structure.',
    defaultModel: 'gpt-4o',
    category: 'Content',
    isPublic: true,
    steps: [
      { label: 'Input', description: 'Provide content details.' },
      { label: 'Generate', description: 'AI generates content.' },
    ],
    credentials: { openai: { label: 'OpenAI API Key', type: 'password' } },
    health: { status: 'Healthy', resources: '1 worker, 512MB RAM' },
    jobQueue: { status: 'Active', dlq: '0 jobs' },
  },
  {
    name: 'Financial Advisor',
    description:
      'Provides financial advice, budgeting tips, and investment guidance',
    defaultPrompt:
      'You are a knowledgeable financial advisor. Help users with budgeting, saving, investing, and financial planning. Provide practical, actionable advice.',
    defaultModel: 'gpt-4o',
    category: 'Finance',
    isPublic: true,
    steps: [
      { label: 'Input', description: 'Provide financial details and goals.' },
      { label: 'Analyze', description: 'AI analyzes financial situation.' },
      { label: 'Advise', description: 'AI provides financial advice.' },
    ],
    credentials: { openai: { label: 'OpenAI API Key', type: 'password' } },
    health: { status: 'Healthy', resources: '1 worker, 512MB RAM' },
    jobQueue: { status: 'Active', dlq: '0 jobs' },
  },
  {
    name: 'Health & Wellness Coach',
    description: 'Offers fitness advice, nutrition tips, and wellness guidance',
    defaultPrompt:
      'You are a certified health and wellness coach. Help users with fitness goals, nutrition advice, and overall wellness. Provide safe, evidence-based recommendations.',
    defaultModel: 'gpt-4o',
    category: 'Health',
    isPublic: true,
    steps: [
      { label: 'Input', description: 'Provide health and fitness details.' },
      { label: 'Assess', description: 'AI assesses health data.' },
      {
        label: 'Recommend',
        description: 'AI provides health and wellness recommendations.',
      },
    ],
    credentials: { openai: { label: 'OpenAI API Key', type: 'password' } },
    health: { status: 'Healthy', resources: '1 worker, 512MB RAM' },
    jobQueue: { status: 'Active', dlq: '0 jobs' },
  },
  {
    name: 'Productivity Master',
    description:
      'Helps optimize your workflow, time management, and productivity',
    defaultPrompt:
      'You are a productivity expert. Help users improve their time management, organization, and workflow efficiency. Provide practical strategies and tools.',
    defaultModel: 'gpt-4o',
    category: 'Productivity',
    isPublic: true,
    steps: [
      {
        label: 'Input',
        description: 'Provide current workflow and time management details.',
      },
      { label: 'Analyze', description: 'AI analyzes workflow and time usage.' },
      {
        label: 'Optimize',
        description: 'AI provides optimization suggestions.',
      },
    ],
    credentials: { openai: { label: 'OpenAI API Key', type: 'password' } },
    health: { status: 'Healthy', resources: '1 worker, 512MB RAM' },
    jobQueue: { status: 'Active', dlq: '0 jobs' },
  },
  {
    name: 'AI Research Assistant',
    description:
      'Helps with AI research, technical explanations, and implementation guidance',
    defaultPrompt:
      'You are an AI research assistant. Help users understand AI concepts, research papers, and implementation details. Provide clear explanations and practical guidance.',
    defaultModel: 'gpt-4o',
    category: 'AI',
    isPublic: true,
    steps: [
      { label: 'Input', description: 'Provide AI research topic or paper.' },
      { label: 'Analyze', description: 'AI analyzes the research material.' },
      {
        label: 'Explain',
        description: 'AI provides explanations and guidance.',
      },
    ],
    credentials: { openai: { label: 'OpenAI API Key', type: 'password' } },
    health: { status: 'Healthy', resources: '1 worker, 512MB RAM' },
    jobQueue: { status: 'Active', dlq: '0 jobs' },
  },
  {
    name: 'Social Media Manager',
    description:
      'Assists with social media strategy, content planning, and engagement',
    defaultPrompt:
      'You are a social media management expert. Help users develop social media strategies, create content calendars, and improve engagement. Provide platform-specific advice.',
    defaultModel: 'gpt-4o',
    category: 'Social',
    isPublic: true,
    steps: [
      {
        label: 'Input',
        description: 'Provide social media goals and current performance.',
      },
      { label: 'Analyze', description: 'AI analyzes social media data.' },
      {
        label: 'Strategize',
        description: 'AI provides strategy and content suggestions.',
      },
    ],
    credentials: { openai: { label: 'OpenAI API Key', type: 'password' } },
    health: { status: 'Healthy', resources: '1 worker, 512MB RAM' },
    jobQueue: { status: 'Active', dlq: '0 jobs' },
  },
  {
    name: 'Learning Tutor',
    description:
      'Provides educational support, study strategies, and learning guidance',
    defaultPrompt:
      'You are an experienced tutor and educator. Help users with learning strategies, study techniques, and academic support. Adapt to different learning styles and subjects.',
    defaultModel: 'gpt-4o',
    category: 'Education',
    isPublic: true,
    steps: [
      { label: 'Input', description: 'Provide subject and learning goals.' },
      { label: 'Assess', description: 'AI assesses learning needs.' },
      {
        label: 'Guide',
        description: 'AI provides study strategies and support.',
      },
    ],
    credentials: { openai: { label: 'OpenAI API Key', type: 'password' } },
    health: { status: 'Healthy', resources: '1 worker, 512MB RAM' },
    jobQueue: { status: 'Active', dlq: '0 jobs' },
  },
  {
    name: 'Marketing Strategist',
    description:
      'Helps develop marketing campaigns, brand strategies, and growth plans',
    defaultPrompt:
      'You are a marketing strategist. Help users develop marketing campaigns, brand strategies, and growth plans. Provide data-driven insights and creative solutions.',
    defaultModel: 'gpt-4o',
    category: 'Marketing',
    isPublic: true,
    steps: [
      {
        label: 'Input',
        description: 'Provide business and marketing details.',
      },
      {
        label: 'Analyze',
        description: 'AI analyzes market data and business goals.',
      },
      {
        label: 'Strategize',
        description: 'AI provides marketing strategy and campaign ideas.',
      },
    ],
    credentials: { openai: { label: 'OpenAI API Key', type: 'password' } },
    health: { status: 'Healthy', resources: '1 worker, 512MB RAM' },
    jobQueue: { status: 'Active', dlq: '0 jobs' },
  },
  {
    name: 'Personal Assistant',
    description:
      'Helps with daily tasks, scheduling, and personal organization',
    defaultPrompt:
      'You are a helpful personal assistant. Help users with daily tasks, scheduling, reminders, and personal organization. Be proactive and efficient.',
    defaultModel: 'gpt-4o',
    category: 'Personal',
    isPublic: true,
    steps: [
      { label: 'Input', description: 'Provide tasks and schedule details.' },
      { label: 'Organize', description: 'AI organizes tasks and schedule.' },
      {
        label: 'Remind',
        description: 'AI sets reminders and provides assistance.',
      },
    ],
    credentials: { openai: { label: 'OpenAI API Key', type: 'password' } },
    health: { status: 'Healthy', resources: '1 worker, 512MB RAM' },
    jobQueue: { status: 'Active', dlq: '0 jobs' },
  },
  {
    name: 'Creative Writer',
    description:
      'Assists with creative writing, storytelling, and content development',
    defaultPrompt:
      'You are a creative writing assistant. Help users develop stories, characters, plots, and creative content. Provide inspiration and writing guidance.',
    defaultModel: 'gpt-4o',
    category: 'Content',
    isPublic: true,
    steps: [
      { label: 'Input', description: 'Provide story or content ideas.' },
      {
        label: 'Develop',
        description: 'AI helps develop stories, characters, and plots.',
      },
      {
        label: 'Refine',
        description: 'AI provides refinement and editing suggestions.',
      },
    ],
    credentials: { openai: { label: 'OpenAI API Key', type: 'password' } },
    health: { status: 'Healthy', resources: '1 worker, 512MB RAM' },
    jobQueue: { status: 'Active', dlq: '0 jobs' },
  },
];

export async function seedAgentTemplates(prisma) {
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
