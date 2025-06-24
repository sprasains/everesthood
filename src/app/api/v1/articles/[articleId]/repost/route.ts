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

  const article = await prisma.article.create({
    data: {
      content: content || `Shared Article:`,
      author: { connect: { id: session.user.id } },
      originalArticleId: articleId,
    },
  });

  return NextResponse.json(article);
}
