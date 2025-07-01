import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { FriendshipStatus } from '@prisma/client';

export async function GET(request: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json([], { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const query = searchParams.get('q') || '';

  // 1. Find all accepted friend relationships for the current user
  const friendships = await prisma.friendship.findMany({
    where: {
      status: FriendshipStatus.ACCEPTED,
      OR: [
        { requesterId: session.user.id },
        { receiverId: session.user.id },
      ],
    },
    select: { requesterId: true, receiverId: true },
  });

  // 2. Extract the IDs of all friends
  const friendIds = friendships.map(f =>
    f.requesterId === session.user.id ? f.receiverId : f.requesterId
  );

  // 3. Search for users within that friend list who match the query
  const friends = await prisma.user.findMany({
    where: {
      AND: [
        { id: { in: friendIds } },
        { name: { contains: query, mode: 'insensitive' } },
      ],
    },
    select: { id: true, name: true, image: true }, // Select fields needed for the mention list
    take: 5, // Limit to 5 results for performance
  });

  return NextResponse.json(friends);
} 