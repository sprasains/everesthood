import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(
  request: NextRequest,
  { params }: { params: { postId: string } }
) {
  try {
    const { postId } = params;
    const post = await prisma.post.findUnique({
      where: { id: postId },
      include: {
        author: {
          select: {
            id: true,
            name: true,
            image: true,
          },
        },
        // Include the original article if it's a repost
        originalArticle: true,
      },
    });

    if (!post) {
      return NextResponse.json({ error: "Post not found" }, { status: 404 });
    }

    return NextResponse.json(post);
  } catch (error) {
    console.error("Error fetching post:", error);
    return NextResponse.json(
      { error: "Failed to fetch post" },
      { status: 500 }
    );
  }
}
