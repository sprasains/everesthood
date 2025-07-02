import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { NotificationType } from "@prisma/client";

// GET a single comment
export async function GET(request: NextRequest, { params }: { params: { postId: string, commentId: string } }) {
  const { commentId } = params;
  const comment = await prisma.comment.findUnique({
    where: { id: commentId },
    include: { author: { select: { name: true, profilePicture: true } } },
  });
  if (!comment) return NextResponse.json({ error: "Comment not found" }, { status: 404 });
  return NextResponse.json(comment);
}

// PATCH (edit) a comment
export async function PATCH(request: NextRequest, { params }: { params: { postId: string, commentId: string } }) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { content } = await request.json();
  const { commentId } = params;
  const comment = await prisma.comment.findUnique({ where: { id: commentId } });
  if (!comment || comment.authorId !== session.user.id) return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  const updated = await prisma.comment.update({ where: { id: commentId }, data: { content } });
  return NextResponse.json(updated);
}

// Helper to recursively remove a comment and its replies from the tree
function removeCommentById(comments, commentId) {
  return comments
    .filter(comment => comment.id !== commentId)
    .map(comment => ({
      ...comment,
      replies: comment.replies ? removeCommentById(comment.replies, commentId) : [],
    }));
}

// DELETE a comment
export async function DELETE(request: NextRequest, { params }: { params: { postId: string, commentId: string } }) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { postId, commentId } = params;

  const post = await prisma.post.findUnique({ where: { id: postId } });
  if (!post) return NextResponse.json({ error: "Post not found" }, { status: 404 });

  let commentsJson = post.commentsJson || [];
  // Optionally: check if the user is the author of the comment (traverse tree to find)
  // For now, just allow delete

  commentsJson = removeCommentById(commentsJson, commentId);

  const updatedPost = await prisma.post.update({
    where: { id: postId },
    data: { commentsJson },
    select: { commentsJson: true }
  });

  return NextResponse.json({ success: true, commentsJson: updatedPost.commentsJson });
}
