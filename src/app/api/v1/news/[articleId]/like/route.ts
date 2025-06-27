import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

// POST /api/v1/news/[articleId]/like
export async function POST(req: NextRequest, { params }: { params: { articleId: string } }) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) return new NextResponse("Unauthorized", { status: 401 });
  const { articleId } = params;
  const userId = session.user.id;

  // Check if already liked
  const existing = await prisma.newsArticleLike.findUnique({
    where: { userId_newsArticleId: { userId, newsArticleId: articleId } },
  });

  if (existing) {
    // Unlike
    await prisma.newsArticleLike.delete({
      where: { userId_newsArticleId: { userId, newsArticleId: articleId } },
    });
  } else {
    // Like
    await prisma.newsArticleLike.create({ data: { userId, newsArticleId: articleId } });
  }

  // Get new like count
  const likeCount = await prisma.newsArticleLike.count({ where: { newsArticleId: articleId } });
  return NextResponse.json({ liked: !existing, likeCount });
} 