import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function POST(
  request: NextRequest,
  { params }: { params: { articleId: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const userId = session.user.id;
    const { articleId } = params;

    const existingLike = await prisma.like.findUnique({
      where: {
        userId_articleId: {
          userId,
          articleId,
        },
      },
    });

    if (existingLike) {
      // User has already liked, so unlike it
      await prisma.like.delete({
        where: {
          userId_articleId: {
            userId,
            articleId,
          },
        },
      });
      // Decrement the article's like count
      const updatedArticle = await prisma.article.update({
        where: { id: articleId },
        data: { likeCount: { decrement: 1 } },
      });
      return NextResponse.json({
        liked: false,
        likeCount: updatedArticle.likeCount,
      });
    } else {
      // User has not liked yet, so like it
      await prisma.like.create({
        data: {
          userId,
          articleId,
        },
      });
      // Increment the article's like count
      const updatedArticle = await prisma.article.update({
        where: { id: articleId },
        data: { likeCount: { increment: 1 } },
      });
      return NextResponse.json({
        liked: true,
        likeCount: updatedArticle.likeCount,
      });
    }
  } catch (error) {
    console.error("Error handling like:", error);
    return NextResponse.json(
      { error: "Failed to update like status" },
      { status: 500 }
    );
  }
}
