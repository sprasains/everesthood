import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

// GET comments for a post
export async function GET(
  request: NextRequest,
  { params }: { params: { postId: string } }
) {
  const { postId } = params;
  const comments = await prisma.comment.findMany({
    where: { postId },
    include: { author: { select: { name: true, image: true } } },
    orderBy: { createdAt: "asc" },
  });
  return NextResponse.json(comments);
}

// POST a new comment
export async function POST(
  request: NextRequest,
  { params }: { params: { postId: string } }
) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id)
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { content } = await request.json();
  const { postId } = params;

  const newComment = await prisma.comment.create({
    data: { content, postId, authorId: session.user.id },
    include: { author: { select: { name: true, image: true } } },
  });

  return NextResponse.json(newComment, { status: 201 });
}
