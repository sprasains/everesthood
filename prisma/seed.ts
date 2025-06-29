import { PrismaClient, User, PostType } from '@prisma/client';
import bcrypt from 'bcrypt';
import { faker } from '@faker-js/faker';

const prisma = new PrismaClient();

export const productivityTips = [
  // Jurukka Uchhalne / High Energy
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
          title: faker.lorem.sentence(7),
          content: createRichTextContent(),
          type: PostType.TEXT,
        },
      });
      postsCreated++;
    }
  }
  console.log(`✅  Successfully created ${postsCreated} additional posts.`);
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
  await prisma.newsArticleLike.deleteMany();
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
      password: hashedPassword,
      bio: 'Platform administrator',
      role: 'ADMIN',
      languagePreference: 'en',
      profileImageUrl: 'https://randomuser.me/api/portraits/men/1.jpg',
      headerImageUrl: 'https://images.unsplash.com/photo-1506744038136-46273834b3fb',
      socialLinks: { twitter: 'https://twitter.com/admin', github: 'https://github.com/admin' },
    },
  });
  console.log('🔑 Admin user created: admin@example.com / password123');

  for (let i = 0; i < testUserCount; i++) {
    const user = await prisma.user.create({
      data: {
        name: `Test User ${i}`,
        email: `test${i}@example.com`,
        password: hashedPassword,
        bio: 'I am a test user for the Everesthood beta!',
        profilePicture: faker.image.avatarGitHub(),
        coverPicture: faker.image.urlLoremFlickr({ category: 'technics' }),
        languagePreference: i % 2 === 0 ? 'en' : 'es',
        isBanned: i === 4, // Ban the last test user
        banReason: i === 4 ? 'Violation of community guidelines' : null,
        profileImageUrl: faker.image.avatarGitHub(),
        headerImageUrl: faker.image.urlLoremFlickr({ category: 'nature' }),
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
      password: hashedPassword,
      isAmbassador: true,
      referralCode: 'ALICE123',
      bio: 'Campus ambassador and influencer',
      profileImageUrl: 'https://randomuser.me/api/portraits/women/10.jpg',
    },
  });
  const ambassador2 = await prisma.user.create({
    data: {
      name: 'Ambassador Bob',
      email: 'bob.ambassador@example.com',
      password: hashedPassword,
      isAmbassador: true,
      referralCode: 'BOB456',
      bio: 'Ambassador for Everesthood',
      profileImageUrl: 'https://randomuser.me/api/portraits/men/11.jpg',
    },
  });
  console.log('🎓 Ambassador Alice: alice.ambassador@example.com / password123, code: ALICE123');
  console.log('🎓 Ambassador Bob: bob.ambassador@example.com / password123, code: BOB456');

  // --- Regular Users, some referred by ambassadors ---
  const referredUser1 = await prisma.user.create({
    data: {
      name: 'Referred User 1',
      email: 'referred1@example.com',
      password: hashedPassword,
      bio: 'Joined via Alice',
      profileImageUrl: 'https://randomuser.me/api/portraits/men/12.jpg',
    },
  });
  const referredUser2 = await prisma.user.create({
    data: {
      name: 'Referred User 2',
      email: 'referred2@example.com',
      password: hashedPassword,
      bio: 'Joined via Bob',
      profileImageUrl: 'https://randomuser.me/api/portraits/women/13.jpg',
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
        password: hashedPassword,
        bio: faker.lorem.sentence(),
        profilePicture: faker.image.avatarGitHub(),
        coverPicture: faker.image.urlLoremFlickr({ category: 'nature' }),
      },
    });
    users.push(user);
  }
  console.log(`👤 Created ${users.length} users.`);

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
        title: faker.lorem.words(5),
        content: contentJson,
        authorId: author.id,
        createdAt: faker.date.recent({ days: 30 }),
      },
    });
    posts.push(post);
  }
  console.log(`📝 Created ${posts.length} posts.`);

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
  const topTipperBadge = await prisma.badge.create({
    data: {
      name: 'Top Tipper',
      description: 'Awarded to the user who tipped the most in the last month.',
      imageUrl: 'https://cdn-icons-png.flaticon.com/512/3135/3135715.png',
    },
  });
  const topCreatorBadge = await prisma.badge.create({
    data: {
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

  console.log('🌱 Seeding complete!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
