import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function POST(
  req: NextRequest,
  { params }: { params: { articleId: string } }
) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id)
    return new NextResponse("Unauthorized", { status: 401 });

  const { articleId } = params;
  const userId = session.user.id;

  const existingLike = await prisma.like.findUnique({
    where: { userId_articleId: { userId, articleId } },
  });

  if (existingLike) {
    await prisma.like.delete({
      where: { userId_articleId: { userId, articleId } },
    });
    const article = await prisma.article.update({
      where: { id: articleId },
      data: { likeCount: { decrement: 1 } },
    });
    return NextResponse.json({ liked: false, likeCount: article.likeCount });
  } else {
    await prisma.like.create({ data: { userId, articleId } });
    const article = await prisma.article.update({
      where: { id: articleId },
      data: { likeCount: { increment: 1 } },
    });
    return NextResponse.json({ liked: true, likeCount: article.likeCount });
  }
}
