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
    include: { author: { select: { name: true, image: true } } },
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

// DELETE a comment
export async function DELETE(request: NextRequest, { params }: { params: { postId: string, commentId: string } }) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { commentId } = params;
  const comment = await prisma.comment.findUnique({ where: { id: commentId } });
  if (!comment || comment.authorId !== session.user.id) return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  await prisma.comment.delete({ where: { id: commentId } });
  return NextResponse.json({ success: true });
}
