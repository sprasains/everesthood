import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

// PUT /api/v1/comments/[commentId] (edit comment, rich text JSON)
export async function PUT(
  req: NextRequest,
  { params }: { params: { commentId: string } }
) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id)
    return new NextResponse("Unauthorized", { status: 401 });
  const { commentId } = params;
  const { content } = await req.json();
  if (!content)
    return NextResponse.json({ error: "Missing content" }, { status: 400 });
  // Only allow the author to update
  const comment = await prisma.comment.findUnique({ where: { id: commentId } });
  if (!comment || comment.authorId !== session.user.id)
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  const updated = await prisma.comment.update({
    where: { id: commentId },
    data: { content },
  });
  return NextResponse.json(updated);
}

// DELETE /api/v1/comments/[commentId] (soft delete: replace content with '[deleted]')
export async function DELETE(
  req: NextRequest,
  { params }: { params: { commentId: string } }
) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id)
    return new NextResponse("Unauthorized", { status: 401 });
  const { commentId } = params;
  const comment = await prisma.comment.findUnique({ where: { id: commentId } });
  if (!comment || comment.authorId !== session.user.id)
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  // Soft delete: replace content with '[deleted]' (as JSON if content is JSON)
  let deletedContent: any = '[deleted]';
  if (comment.content && typeof comment.content === 'object') {
    deletedContent = { deleted: true, text: '[deleted]' };
  }
  await prisma.comment.update({
    where: { id: commentId },
    data: { content: deletedContent },
  });
  return NextResponse.json({ deleted: true });
}
