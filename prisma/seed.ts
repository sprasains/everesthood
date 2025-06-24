import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";
import seedAchievements from "./seed-achievements";

const prisma = new PrismaClient();

async function main() {
  console.log("Start seeding...");

  // Clean up existing data
  await prisma.like.deleteMany();
  await prisma.favorite.deleteMany();
  await prisma.comment.deleteMany();
  await prisma.post.deleteMany();
  await prisma.article.deleteMany();
  await prisma.user.deleteMany();

  // Create Users
  const password = await bcrypt.hash("password123", 10);
  const user1 = await prisma.user.create({
    data: {
      email: "alice@everhood.ai",
      name: "Alice",
      password,
      image: "https://i.pravatar.cc/150?u=alice",
    },
  });
  const user2 = await prisma.user.create({
    data: {
      email: "bob@everhood.ai",
      name: "Bob",
      password,
      image: "https://i.pravatar.cc/150?u=bob",
    },
  });
  console.log("Created users.");

  // Create Articles
  const now = new Date();
  const article1 = await prisma.article.create({
    data: {
      title: "The Rise of Generative AI",
      description: "Exploring how AI tools are changing creative industries.",
      url: "https://example.com/article-ai",
      sourceName: "TechCrunch",
      category: "ai",
      imageUrl: "https://source.unsplash.com/random/400x300/?ai",
      publishedAt: now,
    },
  });
  const article2 = await prisma.article.create({
    data: {
      title: "Next-Gen Fashion Tech",
      description: "From smart fabrics to virtual runway shows.",
      url: "https://example.com/article-fashion",
      sourceName: "Hypebeast",
      category: "fashion",
      imageUrl: "https://source.unsplash.com/random/400x300/?fashion",
      publishedAt: now,
    },
  });
  console.log("Created articles.");

  // Create Likes, Favorites, and Reposts
  await prisma.like.create({
    data: { userId: user1.id, articleId: article2.id },
  });
  await prisma.like.create({
    data: { userId: user2.id, articleId: article1.id },
  });
  await prisma.article.update({
    where: { id: article1.id },
    data: { likeCount: { increment: 1 } },
  });
  await prisma.article.update({
    where: { id: article2.id },
    data: { likeCount: { increment: 1 } },
  });

  await prisma.favorite.create({
    data: { userId: user1.id, articleId: article1.id },
  });

  const post1 = await prisma.post.create({
    data: {
      content: "This is a fascinating read on the future of design!",
      authorId: user1.id,
      originalArticleId: article1.id,
    },
  });
  console.log("Created social interactions.");

  // Create Comments (threaded, likes/dislikes, replies)
  const comment1 = await prisma.comment.create({
    data: {
      content: "This is a fascinating read on the future of design!",
      authorId: user1.id,
      postId: post1.id,
    },
  });
  const comment2 = await prisma.comment.create({
    data: {
      content: "I totally agree! The potential is limitless.",
      authorId: user2.id,
      postId: post1.id,
      parentId: comment1.id,
    },
  });
  // Add more replies (up to 5 per comment)
  for (let i = 0; i < 3; i++) {
    await prisma.comment.create({
      data: {
        content: `Reply ${i + 1} to comment 1`,
        authorId: user1.id,
        postId: post1.id,
        parentId: comment1.id,
      },
    });
  }
  // Likes/dislikes
  await prisma.commentLike.create({
    data: { userId: user2.id, commentId: comment1.id },
  });
  await prisma.commentDislike.create({
    data: { userId: user1.id, commentId: comment2.id },
  });
  console.log("Created threaded comments, likes, dislikes.");

  // Seed Achievements
  await seedAchievements();

  console.log("Seeding finished.");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
