import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { z } from 'zod';

const addFriendSchema = z.object({
  friendId: z.string().min(1),
});

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const url = new URL(request.url);
    const status = url.searchParams.get('status') || 'ACCEPTED';
    const page = parseInt(url.searchParams.get('page') || '1');
    const limit = parseInt(url.searchParams.get('limit') || '20');

    const where: any = {
      userId: session.user.id,
      status
    };

    const [friendships, total] = await Promise.all([
      prisma.friendship.findMany({
        where,
        orderBy: { updatedAt: 'desc' },
        skip: (page - 1) * limit,
        take: limit,
        include: {
          friend: {
            select: {
              id: true,
              name: true,
              image: true,
              email: true,
              level: true,
              xp: true
            }
          }
        }
      }),
      prisma.friendship.count({ where })
    ]);

    // Get pending friend requests
    const pendingRequests = await prisma.friendship.findMany({
      where: {
        friendId: session.user.id,
        status: 'PENDING'
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            image: true,
            email: true,
            level: true,
            xp: true
          }
        }
      },
      orderBy: { createdAt: 'desc' }
    });

    return NextResponse.json({
      friends: friendships,
      pendingRequests,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    });

  } catch (error) {
    console.error('Error fetching friends:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const validatedData = addFriendSchema.parse(body);

    // Check if user is trying to add themselves
    if (validatedData.friendId === session.user.id) {
      return NextResponse.json(
        { error: 'Cannot add yourself as a friend' },
        { status: 400 }
      );
    }

    // Verify friend exists
    const friend = await prisma.user.findUnique({
      where: { id: validatedData.friendId }
    });

    if (!friend) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    // Check if friendship already exists
    const existingFriendship = await prisma.friendship.findFirst({
      where: {
        OR: [
          { userId: session.user.id, friendId: validatedData.friendId },
          { userId: validatedData.friendId, friendId: session.user.id }
        ]
      }
    });

    if (existingFriendship) {
      return NextResponse.json(
        { error: 'Friendship already exists or pending' },
        { status: 400 }
      );
    }

    // Create friendship request
    const friendship = await prisma.friendship.create({
      data: {
        userId: session.user.id,
        friendId: validatedData.friendId,
        status: 'PENDING'
      },
      include: {
        friend: {
          select: {
            id: true,
            name: true,
            image: true,
            email: true,
            level: true,
            xp: true
          }
        }
      }
    });

    // Create notification for friend
    await prisma.notification.create({
      data: {
        userId: validatedData.friendId,
        type: 'follow',
        title: 'New friend request',
        message: `${session.user.name || 'Someone'} wants to be your friend`,
        data: { friendshipId: friendship.id, senderId: session.user.id }
      }
    });

    return NextResponse.json(friendship, { status: 201 });

  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Validation error', details: error.errors },
        { status: 400 }
      );
    }

    console.error('Error adding friend:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
