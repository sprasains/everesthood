import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(req: NextRequest, { params }: { params: { userId: string } }) {
  try {
    const { userId } = params;

    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        name: true,
        image: true,
        createdAt: true,
        level: true,
        xp: true,
      }
    });

    if (!user) return new NextResponse("User not found", { status: 404 });

    // Fetch user's posts and reposts
    const posts = await prisma.post.findMany({
      where: { authorId: userId },
      orderBy: { createdAt: 'desc' },
      include: {
        author: { select: { name: true, image: true } },
        originalArticle: true, // Include article info for reposts
        _count: { select: { comments: true } }
      }
    });
    
    // Fetch friend count
    const friendCount = await prisma.friendship.count({
        where: { status: 'ACCEPTED', OR: [{ requesterId: userId }, { receiverId: userId }] }
    });

    return NextResponse.json({ user, posts, friendCount });
  } catch (error) {
    return new NextResponse("Server Error", { status: 500 });
  }
}
