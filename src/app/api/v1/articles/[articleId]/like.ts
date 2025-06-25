import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function POST(request: NextRequest, { params }: { params: { articleId: string } }) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const articleId = params.articleId;
  const userId = session.user.id;

  // Check if already liked
  const existing = await prisma.like.findUnique({
    where: { userId_articleId: { userId, articleId } },
  });

  if (existing) {
    // Unlike
    await prisma.like.delete({ where: { userId_articleId: { userId, articleId } } });
    await prisma.article.update({ where: { id: articleId }, data: { likeCount: { decrement: 1 } } });
    return NextResponse.json({ liked: false });
  } else {
    // Like
    await prisma.like.create({ data: { userId, articleId } });
    await prisma.article.update({ where: { id: articleId }, data: { likeCount: { increment: 1 } } });
    return NextResponse.json({ liked: true });
  }
}
