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

  // Check if already favorited
  const existing = await prisma.favorite.findUnique({
    where: { userId_articleId: { userId, articleId } },
  });

  if (existing) {
    // Unfavorite
    await prisma.favorite.delete({ where: { userId_articleId: { userId, articleId } } });
    await prisma.article.update({ where: { id: articleId }, data: { favoriteCount: { decrement: 1 } } });
    return NextResponse.json({ favorited: false });
  } else {
    // Favorite
    await prisma.favorite.create({ data: { userId, articleId } });
    await prisma.article.update({ where: { id: articleId }, data: { favoriteCount: { increment: 1 } } });
    return NextResponse.json({ favorited: true });
  }
}
