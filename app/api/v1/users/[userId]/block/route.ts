import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { FriendshipStatus } from "@prisma/client";
import { z } from "zod";

export async function POST(
  request: NextRequest,
  { params }: { params: { userId: string } }
) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // No body expected, but if you add options in the future, validate here
  // Example: const blockSchema = z.object({ reason: z.string().optional() });
  // let body;
  // try {
  //   body = await request.json();
  //   blockSchema.parse(body);
  // } catch (err) {
  //   return NextResponse.json({ error: "Invalid block data", details: err instanceof z.ZodError ? err.errors : err }, { status: 400 });
  // }

  const loggedInUserId = session.user.id;
  const userToBlockId = params.userId;

  if (loggedInUserId === userToBlockId) {
    return NextResponse.json({ error: "You cannot block yourself." }, { status: 400 });
  }
  
  const friendship = await prisma.friendship.upsert({
      where: {
          requesterId_receiverId: {
            requesterId: loggedInUserId,
            receiverId: userToBlockId,
          }
      },
      update: { status: FriendshipStatus.BLOCKED },
      create: {
          requesterId: loggedInUserId,
          receiverId: userToBlockId,
          status: FriendshipStatus.BLOCKED,
      }
  });

  return NextResponse.json({ message: "User has been blocked.", status: friendship.status });
}
