import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { z } from "zod";
import { getSocketServer } from '@/lib/socket-server';

export async function GET(request: NextRequest) {
  const session = await getServerSession(authOptions);
  const userId = session?.user?.id;
  const { searchParams } = new URL(request.url);
  const page = parseInt(searchParams.get("page") || "1");
  const limit = parseInt(searchParams.get("limit") || "10");
  const filter = searchParams.get("filter") || "latest";
  const authorId = searchParams.get("authorId");
  const skip = (page - 1) * limit;

  let where: any = {};
  let orderBy: any = { createdAt: "desc" };

  if (authorId) {
    where.authorId = authorId;
  } else if (filter === "following" && userId) {
    const friends = await prisma.friendship.findMany({
      where: {
        status: "ACCEPTED",
        OR: [{ requesterId: userId }, { receiverId: userId }],
      },
    });
    const friendIds = friends.map((f) =>
      f.requesterId === userId ? f.receiverId : f.requesterId
    );
    where.authorId = { in: [...friendIds, userId] };
  }

  if (filter === "popular") {
    orderBy = { likeCount: "desc" };
  }

  const [posts, total] = await Promise.all([
    prisma.post.findMany({
      where,
      orderBy,
      skip,
      take: limit,
      include: {
        author: { select: { id: true, name: true, image: true } },
        likes: true, // fetch all likes for each post
        _count: { select: { comments: true } },
      },
    }),
    prisma.post.count({ where }),
  ]);

  const result = posts.map((post: any) => ({
    ...post,
    likeCount: post.likeCount, // from Post model
    commentCount: post._count.comments,
    isLiked: userId ? post.likes.some((like: any) => like.userId === userId) : false,
  }));

  return NextResponse.json({
    posts: result,
    total,
    page,
    limit,
    hasMore: skip + limit < total,
  });
}

export async function POST(request: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  // Zod schema for post creation
  const createPostSchema = z.object({
    title: z.string().max(200).optional(),
    content: z.any(),
    type: z.string().optional(),
    metadata: z.any().optional(),
    originalArticle: z.any().optional(),
    mediaUrls: z.array(z.string()).optional(),
    resharedFromId: z.string().optional(),
    mentionedUserIds: z.array(z.string()).optional(),
  });
  let body;
  try {
    body = await request.json();
    createPostSchema.parse(body);
  } catch (err) {
    return NextResponse.json({ error: "Invalid post data", details: err instanceof z.ZodError ? err.errors : err }, { status: 400 });
  }
  const { title, content, type = "TEXT", metadata, originalArticle, mediaUrls, resharedFromId, mentionedUserIds = [] } = body;

  let articleData = {};
  if (originalArticle) {
    const existingArticle = await prisma.article.findUnique({
      where: { url: originalArticle.url },
    });
    if (existingArticle) {
      articleData = { connect: { id: existingArticle.id } };
    } else {
      articleData = { create: originalArticle };
    }
  }

  const post = await prisma.post.create({
    data: {
      title,
      content,
      authorId: session.user.id,
      type,
      metadata,
      mediaUrls,
      resharedFromId,
      ...(originalArticle && { originalArticle: articleData }),
      // Connect mentioned users
      mentionedUsers: mentionedUserIds.length > 0 ? { connect: mentionedUserIds.map((id: string) => ({ id })) } : undefined,
    },
  });

  // Notify all friends (Facebook-style)
  const friendships = await prisma.friendship.findMany({
    where: {
      status: 'ACCEPTED',
      OR: [
        { requesterId: session.user.id },
        { receiverId: session.user.id },
      ],
    },
  });
  const friendIds = friendships.map(f => f.requesterId === session.user.id ? f.receiverId : f.requesterId);
  await Promise.all(friendIds.map(friendId =>
    prisma.notification.create({
      data: {
        recipientId: friendId,
        actorId: session.user.id,
        type: 'NEW_POST',
        entityId: post.id,
      },
    })
  ));

  // Emit websocket event to each friend
  try {
    // @ts-ignore
    if (globalThis.io) {
      friendIds.forEach(friendId => {
        globalThis.io.to(friendId).emit('notification', {
          type: 'NEW_POST',
          postId: post.id,
          actorId: session.user.id,
        });
      });
    }
  } catch (e) { /* ignore */ }

  // Mention notifications for each mentioned user
  for (const mentionedId of mentionedUserIds.filter((id: string) => id !== session.user.id)) {
    await prisma.notification.create({
      data: {
        recipientId: mentionedId,
        actorId: session.user.id,
        type: 'MENTION',
        entityId: post.id,
      },
    });
    try {
      // @ts-ignore
      if (globalThis.io) {
        globalThis.io.to(mentionedId).emit('notification', {
          type: 'MENTION',
          postId: post.id,
          actorId: session.user.id,
        });
      }
    } catch (e) { /* ignore */ }
  }

  return NextResponse.json({ post });
}
