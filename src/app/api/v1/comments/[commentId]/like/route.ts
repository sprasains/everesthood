import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

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
    return NextResponse.json({ liked: true });
  }
}
