import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

// Get all accepted friends
export async function GET(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id)
    return new NextResponse("Unauthorized", { status: 401 });

  const friendships = await prisma.friendship.findMany({
    where: {
      status: "ACCEPTED",
      OR: [{ requesterId: session.user.id }, { receiverId: session.user.id }],
    },
    include: {
      requester: { select: { id: true, name: true, image: true } },
      receiver: { select: { id: true, name: true, image: true } },
    },
  });

  const friends = friendships.map((f) =>
    f.requesterId === session.user.id ? f.receiver : f.requester
  );

  return NextResponse.json(friends);
}
