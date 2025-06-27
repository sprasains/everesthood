import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";

export async function GET(req: NextRequest) {
  const session = await getServerSession(authOptions);
  const userId = session?.user?.id;
  const { searchParams } = new URL(req.url);
  const q = searchParams.get("q") || "";
  if (!q.trim()) return NextResponse.json([]);

  const articles = await prisma.newsArticle.findMany({
    where: {
      OR: [
        { title: { contains: q, mode: "insensitive" } },
        { description: { contains: q, mode: "insensitive" } },
        { content: { contains: q, mode: "insensitive" } },
      ],
    },
    orderBy: { publishedAt: "desc" },
    take: 20,
    include: {
      likes: userId ? { where: { userId } } : false,
      _count: { select: { likes: true } },
    },
  });
  const result = articles.map((article: any) => ({
    ...article,
    likeCount: article._count.likes,
    isLiked: userId ? (article.likes && article.likes.length > 0) : false,
    likes: undefined,
    _count: undefined,
  }));
  return NextResponse.json(result);
}
