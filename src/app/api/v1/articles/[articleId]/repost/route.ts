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
  const { content } = await req.json();

  // Create a new post referencing the newsArticleId
  const post = await prisma.post.create({
    data: {
      authorId: session.user.id,
      newsArticleId: articleId,
      content: content || `Shared Article:`,
      type: 'LINK',
    },
  });

  return NextResponse.json(post);
}
