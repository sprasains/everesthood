import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    const userId = session?.user?.id;
    const { searchParams } = new URL(request.url);
    const limit = parseInt(searchParams.get("limit") || "20");
    const articles = await prisma.newsArticle.findMany({
      orderBy: { publishedAt: "desc" },
      take: limit,
      include: {
        likes: true,
        _count: { select: { likes: true } },
      },
    });
    const result = articles.map((article: any) => ({
      ...article,
      likeCount: article._count.likes,
      isLiked: userId ? (article.likes && article.likes.some((like: any) => like.userId === userId)) : false,
      likes: undefined,
      _count: undefined,
    }));
    return NextResponse.json(result);
  } catch (error) {
    console.error("[NEWS API ERROR]", error);
    return NextResponse.json(
      { error: "Failed to fetch news articles.", details: String(error) },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      title,
      description,
      content,
      sourceName,
      imageUrl,
      publishedAt,
      url,
      category,
      tags,
    } = body;

    const article = await prisma.newsArticle.create({
      data: {
        title,
        description,
        content,
        sourceName,
        imageUrl,
        publishedAt: new Date(publishedAt),
        link: url,
        category,
        tags: tags || [],
      },
    });

    return NextResponse.json({ article }, { status: 201 });
  } catch (error) {
    console.error("Error creating article:", error);
    return NextResponse.json(
      { error: "Failed to create article" },
      { status: 500 }
    );
  }
}
