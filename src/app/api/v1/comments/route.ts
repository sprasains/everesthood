import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

// GET /api/v1/comments?postId=xxx
export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const postId = searchParams.get("postId");
  if (!postId)
    return NextResponse.json({ error: "Missing postId" }, { status: 400 });

  // Fetch all top-level comments and their replies (up to 5 per thread)
  const comments = await prisma.comment.findMany({
    where: { postId, parentId: null },
    orderBy: { createdAt: "asc" },
    include: {
      author: { select: { id: true, name: true, image: true } },
      likes: true,
      dislikes: true,
      replies: {
        take: 5,
        orderBy: { createdAt: "asc" },
        include: {
          author: { select: { id: true, name: true, image: true } },
          likes: true,
          dislikes: true,
        },
      },
    },
  });
  return NextResponse.json(comments);
}

// POST /api/v1/comments (create comment or reply)
export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id)
    return new NextResponse("Unauthorized", { status: 401 });
  const { postId, content, parentId } = await req.json();
  if (!content || !postId)
    return NextResponse.json(
      { error: "Missing content or postId" },
      { status: 400 }
    );
  // Limit to 5 replies per parent
  if (parentId) {
    const replyCount = await prisma.comment.count({ where: { parentId } });
    if (replyCount >= 5)
      return NextResponse.json(
        { error: "Max 5 replies per comment" },
        { status: 400 }
      );
  }
  const comment = await prisma.comment.create({
    data: {
      content,
      authorId: session.user.id,
      postId,
      parentId: parentId || null,
    },
    include: {
      author: { select: { id: true, name: true, image: true } },
      likes: true,
      dislikes: true,
      replies: true,
    },
  });
  return NextResponse.json(comment);
}
