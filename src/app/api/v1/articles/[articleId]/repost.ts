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

  // Create a new post referencing the original article
  const post = await prisma.post.create({
    data: {
      authorId: userId,
      originalArticleId: articleId,
      content: '', // Optionally allow user to add a comment
      type: 'LINK', // or 'REPOST' if you add this type
    },
  });

  return NextResponse.json({ post });
}
