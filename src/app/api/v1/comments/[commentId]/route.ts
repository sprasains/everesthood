import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

// PATCH /api/v1/comments/[commentId] (edit comment)
export async function PATCH(
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
  const comment = await prisma.comment.update({
    where: { id: commentId, authorId: session.user.id },
    data: { content },
  });
  return NextResponse.json(comment);
}

// DELETE /api/v1/comments/[commentId] (delete comment)
export async function DELETE(
  req: NextRequest,
  { params }: { params: { commentId: string } }
) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id)
    return new NextResponse("Unauthorized", { status: 401 });
  const { commentId } = params;
  await prisma.comment.delete({
    where: { id: commentId, authorId: session.user.id },
  });
  return NextResponse.json({ deleted: true });
}
