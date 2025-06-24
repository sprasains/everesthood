import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    const userId = session?.user?.id;

    const { searchParams } = new URL(request.url);
    const category = searchParams.get("category");
    const limit = parseInt(searchParams.get("limit") || "20");

    const where =
      category && category !== "all"
        ? { category: { contains: category, mode: "insensitive" as const } }
        : {};

    const articles = await prisma.article.findMany({
      where,
      orderBy: { publishedAt: "desc" },
      take: limit,
      include: {
        // Include the likes relation to check if the current user has liked it
        likes: {
          where: {
            userId: userId || undefined, // Only include likes from the current user
          },
        },
        favorites: {
          where: {
            userId: userId || undefined, // Only include favorites from the current user
          },
        },
      },
    });

    // Remap articles to include isLiked, isFavorited, likeCount, favoriteCount
    const articlesWithSocial = articles.map((article) => {
      const { likes, favorites, ...rest } = article;
      return {
        ...rest,
        isLiked: likes.length > 0, // True if the likes array is not empty
        isFavorited: favorites.length > 0, // True if the favorites array is not empty
        likeCount: article.likeCount,
        favoriteCount: article.favoriteCount,
      };
    });

    return NextResponse.json({
      articles: articlesWithSocial,
      count: articlesWithSocial.length,
    });
  } catch (error) {
    console.error("Error fetching news:", error);
    return NextResponse.json(
      { error: "Failed to fetch news" },
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

    const article = await prisma.article.create({
      data: {
        title,
        description,
        content,
        sourceName,
        imageUrl,
        publishedAt: new Date(publishedAt),
        url,
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
