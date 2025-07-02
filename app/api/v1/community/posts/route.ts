import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

// GET: List, filter, paginate posts
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
      // Order by like count using Prisma's aggregation
      orderBy = [{ likes: { _count: "desc" } }, { createdAt: "desc" }];
    }

    const [posts, total] = await Promise.all([
      prisma.post.findMany({
        where,
        orderBy,
        skip,
        take: limit,
        select: {
          id: true,
          content: true,
          authorId: true,
          createdAt: true,
          updatedAt: true,
          type: true,
          mediaUrls: true,
          metadata: true,
          viewCount: true,
          isDeleted: true,
          deletedAt: true,
          commentsJson: true,
          author: { select: { id: true, name: true, profilePicture: true } },
          likes: true,
          _count: { select: { likes: true } },
          reshares: true,
        },
      }),
      prisma.post.count({ where }),
    ]);

    // Helper to add like info to comments recursively
    function addCommentLikeInfo(comments, userId) {
      if (!Array.isArray(comments)) return [];
      return comments.map(comment => ({
        ...comment,
        likeCount: Array.isArray(comment.likes) ? comment.likes.length : (comment.likeCount ?? 0),
        isLiked: Array.isArray(comment.likes) && userId ? comment.likes.some(like => like.userId === userId) : false,
        replies: addCommentLikeInfo(comment.replies, userId),
      }));
    }

    const result = posts.map(post => {
      // If commentsJson exists, add like info to each comment
      let commentsJson = post.commentsJson;
      if (commentsJson) {
        commentsJson = addCommentLikeInfo(commentsJson, userId);
      }
      return {
        ...post,
        likeCount: post._count.likes,
        isLiked: userId ? post.likes.some((like: any) => like.userId === userId) : false,
        commentsJson,
        likes: undefined,
        _count: undefined,
      };
    });

    return NextResponse.json({
      posts: result,
      total,
      page,
      limit,
      hasMore: skip + limit < total,
    });
  } catch (error) {
    if (error instanceof Error) {
      console.error('GET /api/v1/community/posts error:', error, error.stack);
    } else {
      console.error('GET /api/v1/community/posts error:', error);
    }
    return NextResponse.json({ error: "Failed to fetch posts" }, { status: 500 });
  }
}

// POST: Create a new post
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    const body = await request.json();
    const { title, content, type = "TEXT", metadata, mediaUrls, newsArticleId, resharedFromId } = body;
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
        mediaUrls,
        newsArticleId,
        resharedFromId,
      },
    });
    return NextResponse.json({ post });
  } catch (error) {
    console.error("POST /api/v1/community/posts error:", error);
    return NextResponse.json({ error: "Failed to create post" }, { status: 500 });
  }
}

// PUT: Edit a post
export async function PUT(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    const body = await request.json();
    const { id, title, content, metadata, mediaUrls } = body;
    if (!id) return NextResponse.json({ error: "Post ID required" }, { status: 400 });
    const post = await prisma.post.update({
      where: { id, authorId: session.user.id },
      data: { title, content, metadata, mediaUrls },
    });
    return NextResponse.json({ post });
  } catch (error) {
    return NextResponse.json({ error: "Failed to update post" }, { status: 500 });
  }
}

// DELETE: Remove a post
export async function DELETE(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");
    if (!id) return NextResponse.json({ error: "Post ID required" }, { status: 400 });
    await prisma.post.delete({ where: { id, authorId: session.user.id } });
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: "Failed to delete post" }, { status: 500 });
  }
}
