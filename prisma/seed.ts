import { PrismaClient, User, PostType } from '@prisma/client';
import bcrypt from 'bcrypt';
import { faker } from '@faker-js/faker';

const prisma = new PrismaClient();

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
  await prisma.user.deleteMany();
  await prisma.notification.deleteMany(); // Remove all notification model variants, use only prisma.notification

  // --- Predictable Test Users ---
  console.log('👤 Creating predictable test users...');
  const testUserCount = 5;
  const testUsers = [];
  const hashedPassword = await bcrypt.hash('password123', 10);
  for (let i = 0; i < testUserCount; i++) {
    const user = await prisma.user.create({
      data: {
        name: `Test User ${i}`,
        email: `test${i}@example.com`,
        password: hashedPassword,
        bio: 'I am a test user for the Everesthood beta!',
        profilePicture: faker.image.avatarGitHub(),
        coverPicture: faker.image.urlLoremFlickr({ category: 'technics' }),
      },
    });
    testUsers.push(user);
  }
  console.log(`👤 Created ${testUsers.length} test users (e.g., test0@example.com).`);

  // *** CALL THE NEW FUNCTION HERE ***
  if (testUsers.length > 0) {
    await seedPostsForUsers(testUsers, prisma);
  }

  // --- Random Users ---
  const userCount = 20;
  const users = [...testUsers];
  for (let i = testUserCount; i < userCount + testUserCount; i++) {
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
