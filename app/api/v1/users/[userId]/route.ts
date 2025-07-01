import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";

export async function GET(
  request: NextRequest,
  { params }: { params: { userId: string } }
) {
  const session = await getServerSession(authOptions);
  const loggedInUserId = session?.user?.id;
  const { userId } = params;

  if (!userId) {
    return NextResponse.json({ error: "User ID not provided" }, { status: 400 });
  }

  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: {
      id: true,
      name: true,
      bio: true,
      profilePicture: true,
      coverPicture: true,
      createdAt: true,
      _count: {
        select: {
          posts: true,
          sentFriendships: { where: { status: 'ACCEPTED' } },
          receivedFriendships: { where: { status: 'ACCEPTED' } },
        },
      },
    },
  });

  if (!user) {
    return NextResponse.json({ error: "User not found" }, { status: 404 });
  }
  
  let friendshipStatus = null;
  if (loggedInUserId && loggedInUserId !== userId) {
      const friendship = await prisma.friendship.findFirst({
          where: {
              OR: [
                  { requesterId: loggedInUserId, receiverId: userId },
                  { requesterId: userId, receiverId: loggedInUserId },
              ]
          }
      });
      friendshipStatus = friendship ? friendship.status : "NONE";
  }

  const { _count, ...userData } = user;
  const friendCount = _count.sentFriendships + _count.receivedFriendships;

  return NextResponse.json({ 
      ...userData, 
      postCount: _count.posts, 
      friendCount,
      friendshipStatus // e.g., 'PENDING', 'ACCEPTED', 'NONE'
  });
}
