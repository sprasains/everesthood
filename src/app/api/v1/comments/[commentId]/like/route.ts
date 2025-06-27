import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
// Add globalThis.io websocket notification support

// POST /api/v1/comments/[commentId]/like
export async function POST(
  req: NextRequest,
  { params }: { params: { commentId: string } }
) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id)
    return new NextResponse("Unauthorized", { status: 401 });
  const { commentId } = params;
  const userId = session.user.id;

  // Fetch the comment to get the author
  const comment = await prisma.comment.findUnique({ where: { id: commentId } });
  if (!comment) return new NextResponse("Comment not found", { status: 404 });

  const existing = await prisma.commentLike.findUnique({
    where: { userId_commentId: { userId, commentId } },
  });
  if (existing) {
    await prisma.commentLike.delete({
      where: { userId_commentId: { userId, commentId } },
    });
    return NextResponse.json({ liked: false });
  } else {
    await prisma.commentLike.create({ data: { userId, commentId } });
    // Notify the comment author (unless liking own comment)
    if (comment.authorId !== userId) {
      await prisma.notification.create({
        data: {
          recipientId: comment.authorId,
          actorId: userId,
          type: 'COMMENT_LIKE',
          entityId: commentId,
        },
      });
      // Emit websocket event to the author
      try {
        // @ts-ignore
        if (globalThis.io) {
          globalThis.io.to(comment.authorId).emit('notification', {
            type: 'COMMENT_LIKE',
            commentId,
            actorId: userId,
          });
        }
      } catch (e) { /* ignore */ }
    }
    return NextResponse.json({ liked: true });
  }
}
