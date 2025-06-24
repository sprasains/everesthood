import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

// POST /api/v1/comments/[commentId]/dislike
export async function POST(
  req: NextRequest,
  { params }: { params: { commentId: string } }
) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id)
    return new NextResponse("Unauthorized", { status: 401 });
  const { commentId } = params;
  const userId = session.user.id;
  const existing = await prisma.commentDislike.findUnique({
    where: { userId_commentId: { userId, commentId } },
  });
  if (existing) {
    await prisma.commentDislike.delete({
      where: { userId_commentId: { userId, commentId } },
    });
    return NextResponse.json({ disliked: false });
  } else {
    await prisma.commentDislike.create({ data: { userId, commentId } });
    return NextResponse.json({ disliked: true });
  }
}
