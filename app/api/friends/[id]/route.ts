import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { z } from 'zod';

const updateFriendshipSchema = z.object({
  action: z.enum(['accept', 'decline', 'block', 'unfriend']),
});

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const validatedData = updateFriendshipSchema.parse(body);

    // Find the friendship
    const friendship = await prisma.friendship.findFirst({
      where: {
        OR: [
          { id: params.id, friendId: session.user.id },
          { id: params.id, userId: session.user.id }
        ]
      },
      include: {
        user: {
          select: { id: true, name: true }
        },
        friend: {
          select: { id: true, name: true }
        }
      }
    });

    if (!friendship) {
      return NextResponse.json({ error: 'Friendship not found' }, { status: 404 });
    }

    let newStatus: string;
    let message: string;

    switch (validatedData.action) {
      case 'accept':
        if (friendship.friendId !== session.user.id) {
          return NextResponse.json(
            { error: 'Only the recipient can accept friend requests' },
            { status: 403 }
          );
        }
        newStatus = 'ACCEPTED';
        message = `You are now friends with ${friendship.user.name}`;
        break;

      case 'decline':
        if (friendship.friendId !== session.user.id) {
          return NextResponse.json(
            { error: 'Only the recipient can decline friend requests' },
            { status: 403 }
          );
        }
        newStatus = 'DECLINED';
        message = `Friend request from ${friendship.user.name} declined`;
        break;

      case 'block':
        newStatus = 'BLOCKED';
        message = `You blocked ${friendship.userId === session.user.id ? friendship.friend.name : friendship.user.name}`;
        break;

      case 'unfriend':
        if (friendship.status !== 'ACCEPTED') {
          return NextResponse.json(
            { error: 'Can only unfriend accepted friends' },
            { status: 400 }
          );
        }
        newStatus = 'DECLINED';
        message = `You unfriended ${friendship.userId === session.user.id ? friendship.friend.name : friendship.user.name}`;
        break;

      default:
        return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
    }

    // Update friendship status
    const updatedFriendship = await prisma.friendship.update({
      where: { id: params.id },
      data: { 
        status: newStatus,
        updatedAt: new Date()
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
        },
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

    // Create notification for the other user
    const otherUserId = friendship.userId === session.user.id 
      ? friendship.friendId 
      : friendship.userId;

    if (validatedData.action === 'accept') {
      await prisma.notification.create({
        data: {
          userId: friendship.userId,
          type: 'follow',
          title: 'Friend request accepted!',
          message: `${friendship.friend.name} accepted your friend request`,
          data: { friendshipId: friendship.id }
        }
      });
    }

    return NextResponse.json({
      friendship: updatedFriendship,
      message
    });

  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Validation error', details: error.errors },
        { status: 400 }
      );
    }

    console.error('Error updating friendship:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Find and delete the friendship
    const friendship = await prisma.friendship.findFirst({
      where: {
        OR: [
          { id: params.id, userId: session.user.id },
          { id: params.id, friendId: session.user.id }
        ]
      }
    });

    if (!friendship) {
      return NextResponse.json({ error: 'Friendship not found' }, { status: 404 });
    }

    await prisma.friendship.delete({
      where: { id: params.id }
    });

    return NextResponse.json({ message: 'Friendship removed successfully' });

  } catch (error) {
    console.error('Error deleting friendship:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
