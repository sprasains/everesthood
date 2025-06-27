import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { FriendshipStatus } from "@prisma/client";

// Send a friend request
export async function POST(request: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const requesterId = session.user.id;

  const { receiverId } = await request.json();

  if (!receiverId) {
    return NextResponse.json({ error: "Receiver ID is required" }, { status: 400 });
  }
  
  if (requesterId === receiverId) {
    return NextResponse.json({ error: "You cannot send a friend request to yourself" }, { status: 400 });
  }

  // Check if a friendship already exists
  const existingFriendship = await prisma.friendship.findFirst({
      where: {
          OR: [
              { requesterId: requesterId, receiverId: receiverId },
              { requesterId: receiverId, receiverId: requesterId },
          ]
      }
  });

  if (existingFriendship) {
      return NextResponse.json({ error: "A friendship request already exists or has been accepted.", status: 409 });
  }

  const newFriendship = await prisma.friendship.create({
    data: {
      requesterId,
      receiverId,
      status: FriendshipStatus.PENDING,
    },
  });

  // Notify the receiver
  await prisma.notification.create({
    data: {
      recipientId: receiverId,
      actorId: requesterId,
      type: 'FRIEND_REQUEST',
      entityId: newFriendship.requesterId,
    },
  });
  // Emit websocket event
  try {
    // @ts-ignore
    if (globalThis.io) {
      globalThis.io.to(receiverId).emit('notification', {
        type: 'FRIEND_REQUEST',
        actorId: requesterId,
      });
    }
  } catch (e) { /* ignore */ }

  return NextResponse.json(newFriendship, { status: 201 });
}

// Get incoming friend requests
export async function GET(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id)
    return new NextResponse("Unauthorized", { status: 401 });

  const requests = await prisma.friendship.findMany({
    where: { receiverId: session.user.id, status: "PENDING" },
    include: { requester: { select: { id: true, name: true, image: true } } },
  });

  return NextResponse.json(requests);
}
