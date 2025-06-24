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

  const existingFavorite = await prisma.favorite.findUnique({
    where: { userId_articleId: { userId, articleId } },
  });

  // Update favorite count on Article
  if (existingFavorite) {
    await prisma.favorite.delete({
      where: { userId_articleId: { userId, articleId } },
    });
    await prisma.article.update({
      where: { id: articleId },
      data: { favoriteCount: { decrement: 1 } },
    });
    const updated = await prisma.article.findUnique({
      where: { id: articleId },
    });
    return NextResponse.json({
      favorited: false,
      favoriteCount: updated?.favoriteCount || 0,
    });
  } else {
    await prisma.favorite.create({ data: { userId, articleId } });
    await prisma.article.update({
      where: { id: articleId },
      data: { favoriteCount: { increment: 1 } },
    });
    const updated = await prisma.article.findUnique({
      where: { id: articleId },
    });
    return NextResponse.json({
      favorited: true,
      favoriteCount: updated?.favoriteCount || 1,
    });
  }
}
