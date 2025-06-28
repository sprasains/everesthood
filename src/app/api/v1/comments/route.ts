import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

// GET /api/v1/comments?postId=xxx
export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const postId = searchParams.get("postId");
  const cursor = searchParams.get("cursor");
  const limit = parseInt(searchParams.get("limit") || "10", 10);
  if (!postId)
    return NextResponse.json({ error: "Missing postId" }, { status: 400 });

  // Fetch paginated top-level comments and their replies (up to 5 per thread)
  const where = { postId, parentId: null };
  const comments = await prisma.comment.findMany({
    where,
    orderBy: { createdAt: "asc" },
    take: limit + 1,
    ...(cursor ? { skip: 1, cursor: { id: cursor } } : {}),
    include: {
      author: { select: { id: true, name: true, image: true } },
      likes: true,
      replies: {
        take: 5,
        orderBy: { createdAt: "asc" },
        include: {
          author: { select: { id: true, name: true, image: true } },
          likes: true,
        },
      },
    },
  });
  let nextCursor = null;
  if (comments.length > limit) {
    nextCursor = comments[comments.length - 1].id;
    comments.pop();
  }
  return NextResponse.json({ comments, nextCursor });
}

// POST /api/v1/comments (create comment or reply)
export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id)
    return new NextResponse("Unauthorized", { status: 401 });
  const { postId, content, parentId } = await req.json();
  if (!content || !postId)
    return NextResponse.json(
      { error: "Missing content or postId" },
      { status: 400 }
    );
  // Limit to 5 replies per parent
  if (parentId) {
    const replyCount = await prisma.comment.count({ where: { parentId } });
    if (replyCount >= 5)
      return NextResponse.json(
        { error: "Max 5 replies per comment" },
        { status: 400 }
      );
  }
  const comment = await prisma.comment.create({
    data: {
      content,
      authorId: session.user.id,
      postId,
      parentId: parentId || null,
    },
    include: {
      author: { select: { id: true, name: true, image: true } },
      likes: true,
      replies: true,
    },
  });
  // --- Notification for reply ---
  if (parentId) {
    const parent = await prisma.comment.findUnique({ where: { id: parentId } });
    if (parent && parent.authorId !== session.user.id) {
      await prisma.notification.create({
        data: {
          recipientId: parent.authorId,
          actorId: session.user.id,
          type: "REPLY",
          entityId: comment.id,
        },
      });
    }
  }
  // --- Mention notifications ---
  let mentionedUserIds: string[] = [];
  if (typeof content === 'string') {
    const mentionMatches = content.match(/@([a-zA-Z0-9_]+)/g) || [];
    if (mentionMatches.length > 0) {
      const usernames = mentionMatches.map(m => m.slice(1));
      const users = await prisma.user.findMany({ where: { name: { in: usernames } } });
      mentionedUserIds = users.map(u => u.id).filter(id => id !== session.user.id);
    }
  }
  for (const mentionedId of mentionedUserIds) {
    await prisma.notification.create({
      data: {
        recipientId: mentionedId,
        actorId: session.user.id,
        type: 'MENTION',
        entityId: comment.id,
      },
    });
    try {
      // @ts-ignore
      if (globalThis.io) {
        globalThis.io.to(mentionedId).emit('notification', {
          type: 'MENTION',
          commentId: comment.id,
          actorId: session.user.id,
        });
      }
    } catch (e) { /* ignore */ }
  }
  return NextResponse.json(comment);
}
