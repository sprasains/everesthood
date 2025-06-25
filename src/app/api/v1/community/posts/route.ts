import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    const userId = session?.user?.id;
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "10");
    const filter = searchParams.get("filter") || "latest";
    const skip = (page - 1) * limit;

    let where: any = {};
    let orderBy: any = { createdAt: "desc" };

    if (filter === "following" && userId) {
      // Get IDs of users the current user follows (friends)
      const friends = await prisma.friendship.findMany({
        where: {
          status: "ACCEPTED",
          OR: [
            { requesterId: userId },
            { receiverId: userId },
          ],
        },
      });
      const friendIds = friends.map(f => f.requesterId === userId ? f.receiverId : f.requesterId);
      where.authorId = { in: friendIds };
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
          likes: userId ? { where: { userId } } : false,
          _count: { select: { likes: true } },
        },
      }),
      prisma.post.count({ where }),
    ]);

    const result = posts.map(post => ({
      ...post,
      likeCount: post._count.likes,
      isLiked: post.likes && post.likes.length > 0,
      likes: undefined,
      _count: undefined,
    }));

    return NextResponse.json({
      posts: result,
      total,
      page,
      limit,
      hasMore: skip + limit < total,
    });
  } catch (error) {
    return NextResponse.json({ error: "Failed to fetch posts" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    const body = await request.json();
    const { title, content, type = "TEXT", metadata } = body;
    if (!content) {
      return NextResponse.json({ error: "Content is required" }, { status: 400 });
    }
    const post = await prisma.post.create({
      data: {
        title: title || null,
        content,
        authorId: session.user.id,
        type,
        metadata,
      },
    });
    return NextResponse.json({ post });
  } catch (error) {
    console.error("POST /api/v1/community/posts error:", error);
    return NextResponse.json({ error: "Failed to create post" }, { status: 500 });
  }
}
