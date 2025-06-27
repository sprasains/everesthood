import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

// Helper to emit comment updates
function emitCommentUpdate(postId: string) {
  // @ts-ignore
  if (globalThis.io) {
    globalThis.io.to(postId).emit("comment_update");
  }
}

// GET comments for a post
export async function GET(
  request: NextRequest,
  { params }: { params: { postId: string } }
) {
  try {
    const { postId } = params;
    const comments = await prisma.comment.findMany({
      where: { postId },
      include: { author: { select: { name: true, image: true, id: true } } },
      orderBy: { createdAt: "asc" },
    });
    return NextResponse.json(comments);
  } catch (err) {
    return NextResponse.json({ error: "Failed to fetch comments", details: err }, { status: 500 });
  }
}

// POST a new comment
export async function POST(
  request: NextRequest,
  { params }: { params: { postId: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id)
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { content, mentionedUserIds = [] } = await request.json();
    const { postId } = params;

    const post = await prisma.post.findUnique({ where: { id: postId } });
    if (!post) return NextResponse.json({ error: "Post not found" }, { status: 404 });

    const newComment = await prisma.comment.create({
      data: {
        content,
        postId,
        authorId: session.user.id,
        // Connect mentioned users if any (assuming you add a relation in the schema)
        // mentionedUsers: mentionedUserIds.length > 0 ? { connect: mentionedUserIds.map((id: string) => ({ id })) } : undefined,
      },
      include: { author: { select: { name: true, image: true, id: true } } },
    });

    // Create notification for post author (if not commenting on own post)
    if (post.authorId !== session.user.id) {
      await prisma.notification.create({
        data: {
          recipientId: post.authorId,
          actorId: session.user.id,
          type: "NEW_COMMENT",
          entityId: postId,
        },
      });
    }
    // Mention notifications for each mentioned user
    for (const mentionedId of mentionedUserIds.filter((id: string) => id !== session.user.id)) {
      await prisma.notification.create({
        data: {
          recipientId: mentionedId,
          actorId: session.user.id,
          type: 'MENTION',
          entityId: postId,
        },
      });
      try {
        // @ts-ignore
        if (globalThis.io) {
          globalThis.io.to(mentionedId).emit('notification', {
            type: 'MENTION',
            postId: postId,
            actorId: session.user.id,
          });
        }
      } catch (e) { /* ignore */ }
    }
    emitCommentUpdate(postId);
    return NextResponse.json(newComment, { status: 201 });
  } catch (err) {
    return NextResponse.json({ error: "Failed to post comment", details: err }, { status: 500 });
  }
}
