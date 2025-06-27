import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
// Add globalThis.io websocket notification support

// POST to like or unlike a post
export async function POST(req: NextRequest, { params }: { params: { postId: string } }) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) return new NextResponse("Unauthorized", { status: 401 });
  const { postId } = params;
  const { action } = await req.json(); // action: 'like' | 'unlike'
  if (!['like', 'unlike'].includes(action)) return new NextResponse("Invalid action", { status: 400 });

  // Fetch the post to get the author
  const post = await prisma.post.findUnique({ where: { id: postId } });
  if (!post) return new NextResponse("Post not found", { status: 404 });

  if (action === 'like') {
    await prisma.like.create({
      data: { userId: session.user.id, articleId: postId },
    });
    // Notify the post author (unless liking own post)
    if (post.authorId !== session.user.id) {
      await prisma.notification.create({
        data: {
          recipientId: post.authorId,
          actorId: session.user.id,
          type: 'POST_LIKE',
          entityId: postId,
        },
      });
      // Emit websocket event to the author
      try {
        // @ts-ignore
        if (globalThis.io) {
          globalThis.io.to(post.authorId).emit('notification', {
            type: 'POST_LIKE',
            postId,
            actorId: session.user.id,
          });
        }
      } catch (e) { /* ignore */ }
    }
    return new NextResponse("Liked", { status: 200 });
  } else {
    await prisma.like.delete({
      where: { userId_articleId: { userId: session.user.id, articleId: postId } },
    });
    return new NextResponse("Unliked", { status: 200 });
  }
}
