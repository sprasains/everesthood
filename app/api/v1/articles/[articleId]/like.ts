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
  const existing = await prisma.newsArticleLike.findUnique({
    where: { userId_newsArticleId: { userId, newsArticleId: articleId } },
  });

  if (existing) {
    // Unlike
    await prisma.newsArticleLike.delete({ where: { userId_newsArticleId: { userId, newsArticleId: articleId } } });
    await prisma.newsArticle.update({ where: { id: articleId }, data: { likes: { delete: { userId_newsArticleId: { userId, newsArticleId: articleId } } } } });
    return NextResponse.json({ liked: false });
  } else {
    // Like
    await prisma.newsArticleLike.create({ data: { userId, newsArticleId: articleId } });
    await prisma.newsArticle.update({ where: { id: articleId }, data: { likes: { create: { userId } } } });
    return NextResponse.json({ liked: true });
  }
}
