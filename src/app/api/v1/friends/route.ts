import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { FriendshipStatus } from "@prisma/client";

export async function GET(request: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const userId = session.user.id;

  const [accepted, pendingReceived, pendingSent] = await Promise.all([
    prisma.friendship.findMany({
      where: {
        status: FriendshipStatus.ACCEPTED,
        OR: [{ requesterId: userId }, { receiverId: userId }],
      },
      include: {
        requester: { select: { id: true, name: true, profilePicture: true } },
        receiver: { select: { id: true, name: true, profilePicture: true } },
      },
    }),
    prisma.friendship.findMany({
      where: { receiverId: userId, status: FriendshipStatus.PENDING },
      include: {
        requester: { select: { id: true, name: true, profilePicture: true } },
      },
    }),
    prisma.friendship.findMany({
      where: { requesterId: userId, status: FriendshipStatus.PENDING },
      include: {
        receiver: { select: { id: true, name: true, profilePicture: true } },
      },
    }),
  ]);

  const friends = accepted.map((f) =>
    f.requesterId === userId ? f.receiver : f.requester
  );

  return NextResponse.json({
    friends,
    pendingReceived,
    pendingSent,
  });
}
