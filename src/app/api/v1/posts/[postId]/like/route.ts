import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

// POST to like or unlike a post
export async function POST(req: NextRequest, { params }: { params: { postId: string } }) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) return new NextResponse("Unauthorized", { status: 401 });
  const { postId } = params;
  const { action } = await req.json(); // action: 'like' | 'unlike'
  if (!['like', 'unlike'].includes(action)) return new NextResponse("Invalid action", { status: 400 });

  if (action === 'like') {
    await prisma.like.create({
      data: { userId: session.user.id, articleId: postId },
    });
    return new NextResponse("Liked", { status: 200 });
  } else {
    await prisma.like.delete({
      where: { userId_articleId: { userId: session.user.id, articleId: postId } },
    });
    return new NextResponse("Unliked", { status: 200 });
  }
}
