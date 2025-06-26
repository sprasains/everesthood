import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { z } from "zod";

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
    content: z.string().min(1).max(1000),
    type: z.string().optional(),
    metadata: z.any().optional(),
    originalArticle: z.any().optional(),
    mediaUrls: z.array(z.string()).optional(),
    resharedFromId: z.string().optional(),
  });
  let body;
  try {
    body = await request.json();
    createPostSchema.parse(body);
  } catch (err) {
    return NextResponse.json({ error: "Invalid post data", details: err instanceof z.ZodError ? err.errors : err }, { status: 400 });
  }
  const { title, content, type = "TEXT", metadata, originalArticle, mediaUrls, resharedFromId } = body;

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
    },
  });
  return NextResponse.json({ post });
}
