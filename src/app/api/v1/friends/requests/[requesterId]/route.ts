import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { FriendshipStatus } from "@prisma/client";

// Accept or Decline a friend request, or remove a friend
export async function POST(
  request: NextRequest,
  { params }: { params: { requesterId: string } }
) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const loggedInUserId = session.user.id;
  const requesterId = params.requesterId;
  const { action } = await request.json(); // 'accept' or 'decline'

  if (!["accept", "decline"].includes(action)) {
    return NextResponse.json({ error: "Invalid action" }, { status: 400 });
  }

  const status =
    action === "accept"
      ? FriendshipStatus.ACCEPTED
      : FriendshipStatus.DECLINED;

  const updatedFriendship = await prisma.friendship
    .update({
      where: {
        requesterId_receiverId: {
          requesterId: requesterId,
          receiverId: loggedInUserId,
        },
        status: FriendshipStatus.PENDING,
      },
      data: {
        status: status,
      },
    })
    .catch(() => null);

  if (!updatedFriendship) {
    return NextResponse.json(
      { error: "Friend request not found or already handled" },
      { status: 404 }
    );
  }

  return NextResponse.json(updatedFriendship);
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { requesterId: string } }
) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const loggedInUserId = session.user.id;
  const otherUserId = params.requesterId;

  // Allows a user to cancel a sent request OR remove an existing friend
  const deletedFriendship = await prisma.friendship.deleteMany({
    where: {
      OR: [
        { requesterId: loggedInUserId, receiverId: otherUserId },
        { requesterId: otherUserId, receiverId: loggedInUserId },
      ],
    },
  });

  if (!deletedFriendship.count) {
    return NextResponse.json({ error: "Friendship not found" }, { status: 404 });
  }

  return NextResponse.json({ message: "Friendship removed successfully" });
}
