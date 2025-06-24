import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

// Send a friend request
export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id)
    return new NextResponse("Unauthorized", { status: 401 });

  const { receiverId } = await req.json();
  if (session.user.id === receiverId) {
    return new NextResponse("Cannot add yourself as a friend.", {
      status: 400,
    });
  }

  const newRequest = await prisma.friendship.create({
    data: { requesterId: session.user.id, receiverId, status: "PENDING" },
  });

  return NextResponse.json(newRequest);
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
