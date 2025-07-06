import { PrismaClient, User, PostType } from '@prisma/client';
import bcrypt from 'bcrypt';
import { faker } from '@faker-js/faker';

const prisma = new PrismaClient();

export const productivityTips = [
 
  { text: "Vibe check: You're crushing it. Keep going." },
  { text: "Main character energy only. Make your move." },
  { text: "Don't just start. Launch." },
  { text: "Less talk, more action. Let's get this bread." },
  { text: "Big goals, bigger hustle." },
  { text: "The only way is up. Start climbing." },
  { text: "That 'new level unlocked' feeling starts now." },
  { text: "Stop scrolling, start doing." },
  { text: "Be the energy you want to attract. Go!" },
  { text: "Execute the vision. No delays." },

  // Motivational & Inspiring
  { text: "Small steps today lead to giant leaps tomorrow." },
  { text: "Progress, not perfection." },
  { text: "The future you is thanking you right now." },
  { text: "You are capable of amazing things." },
  { text: "Don't doubt your worth. You got this." },
  { text: "Create a life you can't wait to wake up to." },
  { text: "The secret to getting ahead is getting started." },
  { text: "Be stronger than your strongest excuse." },
  { text: "Discipline is the bridge between goals and accomplishment." },
  { text: "You didn't come this far to only come this far." },

  // Gen-Z Style Sayings
  { text: "That task isn't gonna complete itself. Bet." },
  { text: "It's giving 'productive'. We love to see it." },
  { text: "Manifesting a finished to-do list. ✨" },
  { text: "Secure the bag, one task at a time." },
  { text: "Understood the assignment. Now, execute." },
  { text: "Iykyk: finishing your list is the ultimate flex." },
  { text: "Stop procrastinating. It's not a good look." },
  { text: "This is your sign to get it done." },
  { text: "No cap, you're about to smash these goals." },
  { text: "Let's turn that 'to-do' into 'ta-da'." },

  // Short & Punchy Phrases
  { text: "Focus up." },
  { text: "Own your day." },
  { text: "Create. Conquer. Repeat." },
  { text: "Do it with passion or not at all." },
  { text: "Make it happen." },
  { text: "Stay hungry. Stay foolish." },
  { text: "Prove them wrong." },
  { text: "Just one more." },
  { text: "Elevate your standards." },
  { text: "Chase excellence." },

  // The 'Classes' / Mindset Shifts
  { text: "Class is in session: Overthinking 101 is cancelled." },
  { text: "Today's lesson: Action cures fear." },
  { text: "Masterclass: Consistency is your new superpower." },
  { text: "Think like a boss, act like a winner." },
  { text: "The assignment is you. Invest in yourself." },
  { text: "Embrace the process. The results will follow." },
  { text: "Your mindset is your greatest asset. Protect it." },
  { text: "Workshop: Building momentum brick by brick." },
  { text: "Lecture: The art of showing up." },
  { text: "Finals: Test your limits and surprise yourself." },
];

// Helper function to create rich text JSON content
const createRichTextContent = () => ({
  type: 'doc',
  content: [
    { type: 'paragraph', content: [{ type: 'text', text: faker.lorem.sentences(2) }] },
    {
      type: 'bulletList',
      content: [
        {
          type: 'listItem',
          content: [{ type: 'paragraph', content: [{ type: 'text', text: faker.hacker.phrase() }] }],
        },
        {
          type: 'listItem',
          content: [{ type: 'paragraph', content: [{ type: 'text', text: faker.hacker.phrase() }] }],
        },
      ],
    },
  ],
});

// *** ADD THIS NEW FUNCTION ***
async function seedPostsForUsers(users: User[], prisma: PrismaClient) {
  console.log(`✍️  Seeding additional posts for ${users.length} specific users...`);
  let postsCreated = 0;
  for (const user of users) {
    // Each user gets between 5 and 15 new posts
    const postCount = faker.number.int({ min: 5, max: 15 });
    for (let i = 0; i < postCount; i++) {
      await prisma.post.create({
        data: {
          authorId: user.id,
          content: createRichTextContent(),
          type: PostType.TEXT,
        },
      });
      postsCreated++;
    }
  }
  console.log(`✅  Successfully created ${postsCreated} additional posts.`);
}

// --- Guided Journaling Prompts Seed ---
const journalPrompts = [
  { promptText: "What are three things you're grateful for today?", category: "GRATITUDE" },
  { promptText: "Who made a positive impact on your life recently?", category: "GRATITUDE" },
  { promptText: "Describe a small joy you experienced today.", category: "GRATITUDE" },
  { promptText: "What is something about your health you appreciate?", category: "GRATITUDE" },
  { promptText: "Recall a recent act of kindness you received.", category: "GRATITUDE" },
  { promptText: "What challenged you today, and how did you respond?", category: "REFLECTION" },
  { promptText: "Describe a moment you felt proud of yourself.", category: "REFLECTION" },
  { promptText: "What did you learn about yourself this week?", category: "REFLECTION" },
  { promptText: "How did you handle stress or frustration today?", category: "REFLECTION" },
  { promptText: "What would you do differently if you could relive today?", category: "REFLECTION" },
  { promptText: "What is one goal you want to focus on tomorrow?", category: "GOAL_SETTING" },
  { promptText: "List a habit you want to build and why.", category: "GOAL_SETTING" },
  { promptText: "What is a small step you can take toward a big dream?", category: "GOAL_SETTING" },
  { promptText: "How will you measure your progress this week?", category: "GOAL_SETTING" },
  { promptText: "What is a skill you want to improve?", category: "GOAL_SETTING" },
  { promptText: "Describe a place where you feel most at peace.", category: "REFLECTION" },
  { promptText: "What is something you're looking forward to?", category: "GOAL_SETTING" },
  { promptText: "Who inspires you and why?", category: "REFLECTION" },
  { promptText: "What is a recent accomplishment you're proud of?", category: "GRATITUDE" },
  { promptText: "How did you show kindness to yourself today?", category: "GRATITUDE" },
];

async function seedJournalPrompts(prisma: any) {
  for (const prompt of journalPrompts) {
    await prisma.journalPrompt.upsert({
      where: { promptText: prompt.promptText },
      update: {},
      create: prompt,
    });
  }
  console.log('Seeded journal prompts!');
}

async function main() {
  console.log('🧹 Clearing old data...');
  // await prisma.appnotification.deleteMany(); // Remove or comment out, as this model does not exist
  await prisma.userAchievement.deleteMany();
  await prisma.achievement.deleteMany();
  await prisma.comment.deleteMany();
  await prisma.postLike.deleteMany();
  await prisma.post.deleteMany();
  await prisma.friendship.deleteMany();
  // await prisma.newsArticleLike.deleteMany();
  await prisma.ambassadorMetric.deleteMany();
  await prisma.tip.deleteMany();
  await prisma.user.deleteMany();
  await prisma.notification.deleteMany(); // Remove all notification model variants, use only prisma.notification

  // --- Predictable Test Users ---
  console.log('👤 Creating predictable test users...');
  const testUserCount = 5;
  const testUsers = [];
  const hashedPassword = await bcrypt.hash('password123', 10);

  // Create an admin user
  const adminUser = await prisma.user.create({
    data: {
      name: 'Admin User',
      email: 'admin@example.com',
      passwordHash: hashedPassword,
      bio: 'Platform administrator',
      role: 'ADMIN',
      languagePreference: 'en',
      profilePicture: 'https://randomuser.me/api/portraits/men/1.jpg',
      socialLinks: { twitter: 'https://twitter.com/admin', github: 'https://github.com/admin' },
    },
  });
  console.log('🔑 Admin user created: admin@example.com / password123');

  for (let i = 0; i < testUserCount; i++) {
    const user = await prisma.user.create({
      data: {
        name: `Test User ${i}`,
        email: `test${i}@example.com`,
        passwordHash: hashedPassword,
        bio: 'I am a test user for the Everesthood beta!',
        profilePicture: faker.image.avatarGitHub(),
        languagePreference: i % 2 === 0 ? 'en' : 'es',
        isBanned: i === 4, // Ban the last test user
        banReason: i === 4 ? 'Violation of community guidelines' : null,
        socialLinks: { twitter: `https://twitter.com/testuser${i}` },
      },
    });
    testUsers.push(user);
  }
  console.log(`👤 Created ${testUsers.length} test users (e.g., test0@example.com).`);

  // *** CALL THE NEW FUNCTION HERE ***
  if (testUsers.length > 0) {
    await seedPostsForUsers(testUsers, prisma);
  }

  // --- Ambassador Users ---
  const ambassador1 = await prisma.user.create({
    data: {
      name: 'Ambassador Alice',
      email: 'alice.ambassador@example.com',
      passwordHash: hashedPassword,
      isAmbassador: true,
      referralCode: 'ALICE123',
      bio: 'Campus ambassador and influencer',
      profilePicture: 'https://randomuser.me/api/portraits/women/10.jpg',
    },
  });
  const ambassador2 = await prisma.user.create({
    data: {
      name: 'Ambassador Bob',
      email: 'bob.ambassador@example.com',
      passwordHash: hashedPassword,
      isAmbassador: true,
      referralCode: 'BOB456',
      bio: 'Ambassador for Everesthood',
      profilePicture: 'https://randomuser.me/api/portraits/men/11.jpg',
    },
  });
  console.log('🎓 Ambassador Alice: alice.ambassador@example.com / password123, code: ALICE123');
  console.log('🎓 Ambassador Bob: bob.ambassador@example.com / password123, code: BOB456');

  // --- Regular Users, some referred by ambassadors ---
  const referredUser1 = await prisma.user.create({
    data: {
      name: 'Referred User 1',
      email: 'referred1@example.com',
      passwordHash: hashedPassword,
      bio: 'Joined via Alice',
      profilePicture: 'https://randomuser.me/api/portraits/men/12.jpg',
    },
  });
  const referredUser2 = await prisma.user.create({
    data: {
      name: 'Referred User 2',
      email: 'referred2@example.com',
      passwordHash: hashedPassword,
      bio: 'Joined via Bob',
      profilePicture: 'https://randomuser.me/api/portraits/women/13.jpg',
    },
  });
  await prisma.ambassadorMetric.create({
    data: {
      ambassadorId: ambassador1.id,
      referredUserId: referredUser1.id,
    },
  });
  await prisma.ambassadorMetric.create({
    data: {
      ambassadorId: ambassador2.id,
      referredUserId: referredUser2.id,
    },
  });

  // --- Random Users ---
  const userCount = 20;
  const users = [...testUsers, ambassador1, ambassador2, referredUser1, referredUser2];
  for (let i = testUserCount + 4; i < userCount + testUserCount; i++) {
    const user = await prisma.user.create({
      data: {
        name: faker.person.fullName(),
        email: faker.internet.email(),
        passwordHash: hashedPassword,
        bio: faker.lorem.sentence(),
        profilePicture: faker.image.avatarGitHub(),
      },
    });
    users.push(user);
  }
  console.log(`👤 Created ${users.length} users.`);
  console.log('👤 Sample users:', users.slice(0,2));

  // --- Friendships ---
  console.log('🤝 Creating friendships...');
  for (let i = 0; i < users.length; i++) {
    for (let j = i + 1; j < users.length; j++) {
      if (Math.random() < 0.2) {
        await prisma.friendship.create({
          data: {
            requesterId: users[i].id,
            receiverId: users[j].id,
            status: 'ACCEPTED',
          },
        });
      }
    }
  }

  // --- Posts ---
  console.log('📝 Creating posts...');
  const postCount = 100;
  const posts = [];
  for (let i = 0; i < postCount; i++) {
    const author = users[Math.floor(Math.random() * users.length)];
    const contentJson = {
      type: 'doc',
      content: [
        { type: 'paragraph', content: [{ type: 'text', text: faker.lorem.sentences(2) }] },
        {
          type: 'bulletList',
          content: [
            {
              type: 'listItem',
              content: [{ type: 'paragraph', content: [{ type: 'text', text: faker.hacker.phrase() }] }],
            },
            {
              type: 'listItem',
              content: [{ type: 'paragraph', content: [{ type: 'text', text: faker.hacker.phrase() }] }],
            },
          ],
        },
      ],
    };
    const post = await prisma.post.create({
      data: {
        content: contentJson,
        authorId: author.id,
        createdAt: faker.date.recent({ days: 30 }),
      },
    });
    posts.push(post);
  }
  console.log(`📝 Created ${posts.length} posts.`);
  console.log('📝 Sample posts:', posts.slice(0,2));

  // --- Comments ---
  console.log('💬 Creating comments...');
  for (const post of posts) {
    const commentCount = Math.floor(Math.random() * 5);
    for (let i = 0; i < commentCount; i++) {
      const user = users[Math.floor(Math.random() * users.length)];
      await prisma.comment.create({
        data: {
          content: faker.lorem.sentence(),
          postId: post.id,
          authorId: user.id,
        },
      });
    }
  }

  // --- Likes ---
  console.log('👍 Creating likes...');
  for (const post of posts) {
    for (const user of users) {
      if (Math.random() < 0.1) {
        await prisma.postLike.create({
          data: {
            postId: post.id,
            userId: user.id,
          },
        });
      }
    }
  }

  // --- Achievements & UserAchievements ---
  console.log('🏆 Creating achievements...');
  const achievementTypes = [
    { name: 'First Post', description: 'Created your first post!', icon: '🥇', xpReward: 100 },
    { name: 'Commenter', description: 'Left 10 comments!', icon: '💬', xpReward: 50 },
    { name: 'Popular', description: 'Received 10 likes!', icon: '🔥', xpReward: 200 },
  ];
  const achievements = [];
  for (const ach of achievementTypes) {
    const a = await prisma.achievement.create({ data: ach });
    achievements.push(a);
  }
  for (const user of users) {
    if (Math.random() < 0.3) {
      const achievement = achievements[Math.floor(Math.random() * achievements.length)];
      await prisma.userAchievement.create({
        data: {
          userId: user.id,
          achievementId: achievement.id,
          earnedAt: new Date(),
        },
      });
    }
  }

  // --- Notifications ---
  console.log('🔔 Creating notifications...');
  for (const user of users) {
    if (Math.random() < 0.5) {
      const actor = users[Math.floor(Math.random() * users.length)];
      if (actor.id === user.id) continue;
      await prisma.notification.create({
        data: {
          recipientId: user.id,
          actorId: actor.id,
          type: 'NEW_COMMENT',
          entityId: posts[Math.floor(Math.random() * posts.length)].id,
          isRead: false,
          createdAt: new Date(),
        },
      });
    }
  }

  // --- Badges ---
  const topTipperBadge = await prisma.badge.upsert({
    where: { name: 'Top Tipper' },
    update: {},
    create: {
      name: 'Top Tipper',
      description: 'Awarded to the user who tipped the most in the last month.',
      imageUrl: 'https://cdn-icons-png.flaticon.com/512/3135/3135715.png',
    },
  });
  const topCreatorBadge = await prisma.badge.upsert({
    where: { name: 'Top Creator' },
    update: {},
    create: {
      name: 'Top Creator',
      description: 'Awarded to the creator who earned the most tips in the last month.',
      imageUrl: 'https://cdn-icons-png.flaticon.com/512/3135/3135768.png',
    },
  });
  console.log('🏅 Seeded badges: Top Tipper, Top Creator');

  // --- Tips ---
  // Use first 3 users and first 3 posts for demo tips
  const tipper = users[0];
  const creator = users[1];
  const post = posts[0];
  await prisma.tip.create({
    data: {
      tipperId: tipper.id,
      creatorId: creator.id,
      postId: post.id,
      amount: 10.0,
    },
  });
  await prisma.tip.create({
    data: {
      tipperId: tipper.id,
      creatorId: creator.id,
      postId: posts[1].id,
      amount: 5.0,
    },
  });
  await prisma.tip.create({
    data: {
      tipperId: users[2].id,
      creatorId: creator.id,
      postId: posts[2].id,
      amount: 20.0,
    },
  });
  console.log('💸 Seeded sample tips.');

  // --- Award badges for demo ---
  await prisma.userBadge.create({
    data: {
      userId: tipper.id,
      badgeId: topTipperBadge.id,
    },
  });
  await prisma.userBadge.create({
    data: {
      userId: creator.id,
      badgeId: topCreatorBadge.id,
    },
  });
  console.log('🏆 Awarded demo badges to top tipper and creator.');

  // Seed demo user and tasks
  const demoUser = await prisma.user.upsert({
    where: { email: 'demo@everesthood.com' },
    update: {},
    create: {
      email: 'demo@everesthood.com',
      name: 'Demo User',
      passwordHash: await bcrypt.hash('password123', 10),
      profilePicture: faker.image.avatarGitHub(),
    },
  });

  // Seed demo tasks
  await prisma.task.createMany({
    data: [
      { content: 'Try out the Productivity Hub!', ownerId: demoUser.id },
      { content: 'Complete your first task', ownerId: demoUser.id },
      { content: 'Read a productivity tip', ownerId: demoUser.id },
    ],
    skipDuplicates: true,
  });

  // Seed productivity tips
  await prisma.productivityTip.createMany({
    data: productivityTips.map(tip => ({ text: tip.text })),
    skipDuplicates: true,
  });

  // Seed Money & Hustle Guides
  // @ts-expect-error: guide model may not exist until migration is run
  await prisma.guide.createMany({
    data: [
      {
        title: "How to Create Your First Budget",
        slug: "create-your-first-budget",
        shortDescription: "A step-by-step guide to building your first personal budget.",
        coverImageUrl: "/images/guides/budget.jpg",
        category: "FINANCE",
        content: `# How to Create Your First Budget\n\nLearn how to take control of your money with a simple, effective budget.\n\n## Step 1: List Your Income\n...`,
        author: "Alex Morgan",
        publishedAt: new Date("2024-06-01T10:00:00Z"),
      },
      {
        title: "Decoding Your Paycheck",
        slug: "decoding-your-paycheck",
        shortDescription: "Understand what all those deductions and numbers mean on your pay stub.",
        coverImageUrl: "/images/guides/paycheck.jpg",
        category: "FINANCE",
        content: `# Decoding Your Paycheck\n\nEver wondered where your money goes? Let's break down your pay stub.\n\n## Gross vs. Net Pay\n...`,
        author: "Jamie Lee",
        publishedAt: new Date("2024-06-05T14:30:00Z"),
      },
      {
        title: "5 Steps to Start a Side Hustle",
        slug: "5-steps-to-start-a-side-hustle",
        shortDescription: "Turn your skills and passions into extra income with these actionable steps.",
        coverImageUrl: "/images/guides/side-hustle.jpg",
        category: "CAREER",
        content: `# 5 Steps to Start a Side Hustle\n\nReady to earn more? Here are five steps to launch your side gig.\n\n## 1. Identify Your Skills\n...`,
        author: "Taylor Brooks",
        publishedAt: new Date("2024-06-10T09:00:00Z"),
      },
      {
        title: "Building a Winning Resume",
        slug: "building-a-winning-resume",
        shortDescription: "Tips and tricks to make your resume stand out to employers.",
        coverImageUrl: "/images/guides/resume.jpg",
        category: "CAREER",
        content: `# Building a Winning Resume\n\nYour resume is your first impression. Make it count!\n\n## Highlight Your Achievements\n...`,
        author: "Morgan Smith",
        publishedAt: new Date("2024-06-15T16:45:00Z"),
      },
    ],
    skipDuplicates: true,
  });

  // Seed demo Digital Detox Plans
  await prisma.digitalDetoxPlan.create({
    data: {
      title: "7-Day Social Media Detox",
      description: "Take a break from social media and reclaim your focus with this 7-day plan.",
      coverImage: "/images/detox/social-media.jpg",
      tasks: {
        create: [
          { day: 1, title: "Awareness Day", content: "Track your social media usage today.", order: 1 },
          { day: 2, title: "Notification Cleanse", content: "Turn off non-essential notifications.", order: 1 },
          { day: 3, title: "App Audit", content: "Uninstall or hide distracting apps.", order: 1 },
          { day: 4, title: "Offline Challenge", content: "Spend 2 hours device-free.", order: 1 },
          { day: 5, title: "Mindful Mornings", content: "No phone for 1 hour after waking.", order: 1 },
          { day: 6, title: "Social Swap", content: "Replace 30 minutes of scrolling with a hobby.", order: 1 },
          { day: 7, title: "Reflection & Plan", content: "Reflect on your week and set new boundaries.", order: 1 },
        ],
      },
    },
  });

  await prisma.digitalDetoxPlan.create({
    data: {
      title: "5-Day Digital Declutter",
      description: "Declutter your digital life and boost productivity in 5 days.",
      coverImage: "/images/detox/declutter.jpg",
      tasks: {
        create: [
          { day: 1, title: "Inbox Zero", content: "Clean up your email inbox.", order: 1 },
          { day: 2, title: "Photo Purge", content: "Delete unnecessary photos from your phone.", order: 1 },
          { day: 3, title: "Unsubscribe Day", content: "Unsubscribe from unwanted emails.", order: 1 },
          { day: 4, title: "File Organization", content: "Organize files on your desktop/cloud.", order: 1 },
          { day: 5, title: "App Audit", content: "Remove unused apps and update passwords.", order: 1 },
        ],
      },
    },
  });

  console.log('🌱 Seeding complete!');

  const allTasks = await prisma.task.findMany();
  console.log('✅ Sample tasks:', allTasks.slice(0,2));
  const allTips = await prisma.productivityTip.findMany();
  console.log('💡 Sample productivity tips:', allTips.slice(0,2));

  // At the end of your main seed function:
  await seedJournalPrompts(prisma);

  // Place this at the end of your main seed function, after all other seeding
  const analyticsGuides = await prisma.guide.findMany();
  const analyticsUsers = await prisma.user.findMany({ take: 3 });
  if (analyticsGuides.length && analyticsUsers.length) {
    for (const guide of analyticsGuides) {
      // Add random views
      for (let i = 0; i < Math.floor(Math.random() * 20) + 5; i++) {
        await prisma.guideView.create({
          data: {
            guideId: guide.id,
            userId: analyticsUsers[Math.floor(Math.random() * analyticsUsers.length)].id,
            viewedAt: new Date(Date.now() - Math.floor(Math.random() * 7) * 24 * 60 * 60 * 1000),
          },
        });
      }
      // Add random favorites
      for (let i = 0; i < Math.floor(Math.random() * analyticsUsers.length); i++) {
        await prisma.guideFavorite.create({
          data: {
            guideId: guide.id,
            userId: analyticsUsers[i].id,
            favoritedAt: new Date(Date.now() - Math.floor(Math.random() * 7) * 24 * 60 * 60 * 1000),
          },
        });
      }
    }
  }

  // Seed Digital Detox Achievements
  await prisma.achievement.createMany({
    data: [
      { name: "First Detox Day", description: "Complete your first digital detox task.", icon: "��", xpReward: 10 },
      { name: "Streak Starter", description: "Complete tasks 2 days in a row.", icon: "��", xpReward: 20 },
      { name: "Detox Master", description: "Complete all tasks in a digital detox plan.", icon: "🏆", xpReward: 50 },
      { name: "Consistency Champ", description: "Complete a task every day for a week.", icon: "💪", xpReward: 100 },
    ],
    skipDuplicates: true,
  });
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
