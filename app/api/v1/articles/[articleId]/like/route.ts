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

  const existingLike = await prisma.newsArticleLike.findUnique({
    where: { userId_newsArticleId: { userId, newsArticleId: articleId } },
  });

  if (existingLike) {
    await prisma.newsArticleLike.delete({
      where: { userId_newsArticleId: { userId, newsArticleId: articleId } },
    });
    return NextResponse.json({ liked: false });
  } else {
    await prisma.newsArticleLike.create({ data: { userId, newsArticleId: articleId } });
    return NextResponse.json({ liked: true });
  }
}
