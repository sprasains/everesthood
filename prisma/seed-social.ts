import { PrismaClient, User, Post, PostType, FriendshipStatus, NotificationType } from '@prisma/client';
import { faker } from '@faker-js/faker';

// Helper function to generate rich text JSON content
const createRichTextContent = (paragraphCount: number = 3) => ({
  type: 'doc',
  content: Array.from({ length: paragraphCount }).map(() => ({
    type: 'paragraph',
    content: [{ type: 'text', text: faker.lorem.paragraph({ min: 2, max: 5 }) }],
  })),
});

export async function seedSocialGraph(prisma: PrismaClient, allUsers: User[]) {
  console.log('🤝 Weaving a dense social graph...');
  let friendshipCount = 0;
  for (let i = 0; i < allUsers.length; i++) {
    const friendsCount = faker.number.int({ min: 10, max: 40 });
    const potentialFriends = allUsers.filter(u => u.id !== allUsers[i].id);
    const friends = faker.helpers.arrayElements(potentialFriends, friendsCount);
    for (const friend of friends) {
      await prisma.friendship.create({
        data: { requesterId: allUsers[i].id, receiverId: friend.id, status: FriendshipStatus.ACCEPTED },
      }).catch(() => {});
      friendshipCount++;
    }
    // Add some pending, declined, and blocked requests for the first 10 users
    if (i < 10) {
      const pending = faker.helpers.arrayElements(potentialFriends, 2);
      for (const p of pending) {
        await prisma.friendship.create({
          data: { requesterId: allUsers[i].id, receiverId: p.id, status: FriendshipStatus.PENDING },
        }).catch(() => {});
      }
      const declined = faker.helpers.arrayElements(potentialFriends, 1);
      for (const d of declined) {
        await prisma.friendship.create({
          data: { requesterId: allUsers[i].id, receiverId: d.id, status: FriendshipStatus.DECLINED },
        }).catch(() => {});
      }
      const blocked = faker.helpers.arrayElements(potentialFriends, 1);
      for (const b of blocked) {
        await prisma.friendship.create({
          data: { requesterId: allUsers[i].id, receiverId: b.id, status: FriendshipStatus.BLOCKED },
        }).catch(() => {});
      }
    }
  }
  console.log(`✅ Created approximately ${friendshipCount} friendships.`);

  console.log('📝 Generating a massive volume of posts, comments, likes, and notifications...');
  let postCount = 0;
  let commentCount = 0;
  let likeCount = 0;
  let notificationCount = 0;

  for (const user of allUsers) {
    const postsToCreate = faker.number.int({ min: 15, max: 50 });
    for (let i = 0; i < postsToCreate; i++) {
      // Create the main post
      const post = await prisma.post.create({
        data: {
          title: faker.lorem.sentence(),
          authorId: user.id,
          content: createRichTextContent(faker.number.int({ min: 2, max: 8 })),
          type: PostType.TEXT,
          createdAt: faker.date.between({ from: '2023-01-01T00:00:00.000Z', to: '2025-07-16T00:00:00.000Z' }),
          viewCount: faker.number.int({ min: 100, max: 50000 }),
        },
      });
      postCount++;

      // Create Likes and Notifications for Likes
      // A random number of users will like this post
      const likers = faker.helpers.arrayElements(allUsers, faker.number.int({ min: 10, max: 100 }));
      for (const liker of likers) {
        if (liker.id !== user.id) {
          await prisma.postLike.create({ data: { postId: post.id, userId: liker.id } });
          likeCount++;
          // Create a notification for the post author
          await prisma.notification.create({
            data: { 
              recipientId: user.id, 
              actorId: liker.id, 
              type: NotificationType.POST_LIKE, 
              entityId: post.id 
            },
          });
          notificationCount++;
        }
      }

      // Create a thread of Comments and Notifications for Comments
      const topLevelCommentCount = faker.number.int({ min: 5, max: 20 });
      for (let j = 0; j < topLevelCommentCount; j++) {
        const commenter = faker.helpers.arrayElement(allUsers.filter(u => u.id !== user.id));
        const parentComment = await prisma.comment.create({
          data: {
            content: faker.lorem.sentence({ min: 5, max: 25 }),
            postId: post.id,
            authorId: commenter.id,
          },
        });
        commentCount++;

        // Notify post author about the new comment
        await prisma.notification.create({
          data: { 
            recipientId: user.id, 
            actorId: commenter.id, 
            type: NotificationType.NEW_COMMENT, 
            entityId: post.id 
          },
        });
        notificationCount++;

        // Create nested replies (a sub-thread)
        const repliesToCreate = faker.number.int({ min: 0, max: 5 });
        let lastCommentInThread = parentComment;
        for (let k = 0; k < repliesToCreate; k++) {
          const replier = faker.helpers.arrayElement(allUsers.filter(u => u.id !== lastCommentInThread.authorId));
          const reply = await prisma.comment.create({
            data: {
              content: faker.lorem.sentence({ min: 3, max: 15 }),
              postId: post.id,
              authorId: replier.id,
              parentId: lastCommentInThread.id, // Link to the parent comment
            },
          });
          commentCount++;

          // Notify the parent comment author about the reply
          await prisma.notification.create({
            data: { 
              recipientId: lastCommentInThread.authorId, 
              actorId: replier.id, 
              type: NotificationType.MENTION, // Or a new 'REPLY' type
              entityId: lastCommentInThread.id 
            },
          });
          notificationCount++;
          lastCommentInThread = reply; // Update for deeper nesting
        }
      }
    }
    console.log(`... finished seeding for user ${user.name}`);
  }
  console.log(`✅ Created ${postCount} posts, ${commentCount} comments, ${likeCount} likes, and ${notificationCount} notifications.`);
} 