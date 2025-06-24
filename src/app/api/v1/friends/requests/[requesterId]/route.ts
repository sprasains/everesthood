import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

// Accept or Decline a friend request
export async function PUT(
  req: NextRequest,
  { params }: { params: { requesterId: string } }
) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id)
    return new NextResponse("Unauthorized", { status: 401 });

  const { requesterId } = params;
  const { status } = await req.json(); // "ACCEPTED" or "DECLINED"

  if (status !== "ACCEPTED" && status !== "DECLINED") {
    return new NextResponse("Invalid status", { status: 400 });
  }

  const updatedFriendship = await prisma.friendship.update({
    where: {
      requesterId_receiverId: { requesterId, receiverId: session.user.id },
    },
    data: { status },
  });

  return NextResponse.json(updatedFriendship);
}
