import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

// Create or update group chat
export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id)
      return new NextResponse('Unauthorized', { status: 401 });

    const data = await req.json();
    const { name, participantIds, avatar, isUpdate, conversationId } = data;

    if (!isUpdate && (!name || !participantIds || participantIds.length < 2)) {
      return NextResponse.json(
        { error: 'Name and at least 2 participants required' },
        { status: 400 }
      );
    }

    if (isUpdate && !conversationId) {
      return NextResponse.json(
        { error: 'Conversation ID required for updates' },
        { status: 400 }
      );
    }

    // For updates, verify user is an admin
    if (isUpdate) {
      const hasAccess = await prisma.conversation.findFirst({
        where: {
          id: conversationId,
          participants: {
            some: {
              userId: session.user.id,
              isAdmin: true,
            },
          },
        },
      });

      if (!hasAccess) {
        return NextResponse.json(
          { error: 'Not authorized to update this group' },
          { status: 403 }
        );
      }
    }

    // Create or update group
    const group = isUpdate
      ? await prisma.conversation.update({
          where: { id: conversationId },
          data: {
            name: name,
            avatar: avatar,
            ...(participantIds && {
              participants: {
                deleteMany: {},
                create: [...participantIds, session.user.id].map((id) => ({
                  userId: id,
                  isAdmin: id === session?.user?.id,
                })),
              },
            }),
          },
          include: {
            participants: {
              include: {
                user: {
                  select: {
                    id: true,
                    name: true,
                    email: true,
                    profilePicture: true,
                  },
                },
              },
            },
          },
        })
      : await prisma.conversation.create({
          data: {
            type: 'GROUP',
            name: name,
            avatar: avatar,
            participants: {
              create: [...participantIds, session.user.id].map((id) => ({
                userId: id,
                isAdmin: id === session?.user?.id,
              })),
            },
          },
          include: {
            participants: {
              include: {
                user: {
                  select: {
                    id: true,
                    name: true,
                    email: true,
                    profilePicture: true,
                  },
                },
              },
            },
          },
        });

    // Create system message for group creation/update
    await prisma.message.create({
      data: {
        conversationId: group.id,
        content: isUpdate
          ? `${session.user.name} updated the group`
          : `${session.user.name} created the group`,
        senderId: session.user.id,
        type: 'SYSTEM',
      },
    });

    return NextResponse.json(group, { status: isUpdate ? 200 : 201 });
  } catch (error) {
    console.error('Error managing group:', error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
}

// Add/remove participants or update admin status
export async function PUT(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id)
      return new NextResponse('Unauthorized', { status: 401 });

    const data = await req.json();
    const { conversationId, action, userId, newAdminStatus } = data;

    if (!conversationId || !action || !userId) {
      return NextResponse.json(
        { error: 'Conversation ID, action, and user ID required' },
        { status: 400 }
      );
    }

    // Verify user is an admin
    const hasAccess = await prisma.conversation.findFirst({
      where: {
        id: conversationId,
        type: 'GROUP',
        participants: {
          some: {
            userId: session.user.id,
            isAdmin: true,
          },
        },
      },
    });

    if (!hasAccess) {
      return NextResponse.json(
        { error: 'Not authorized to manage this group' },
        { status: 403 }
      );
    }

    let result;
    switch (action) {
      case 'add':
        result = await prisma.conversation.update({
          where: { id: conversationId },
          data: {
            participants: {
              create: {
                userId: userId,
                isAdmin: false,
              },
            },
          },
        });

        // Create system message
        await prisma.message.create({
          data: {
            conversationId,
            content: `${session.user.name} added a new member to the group`,
            senderId: session.user.id,
            type: 'SYSTEM',
          },
        });
        break;

      case 'remove':
        result = await prisma.conversation.update({
          where: { id: conversationId },
          data: {
            participants: {
              deleteMany: {
                userId: userId,
              },
            },
          },
        });

        await prisma.message.create({
          data: {
            conversationId,
            content: `${session.user.name} removed a member from the group`,
            senderId: session.user.id,
            type: 'SYSTEM',
          },
        });
        break;

      case 'updateAdmin':
        if (typeof newAdminStatus !== 'boolean') {
          return NextResponse.json(
            { error: 'New admin status required' },
            { status: 400 }
          );
        }

        result = await prisma.conversation.update({
          where: { id: conversationId },
          data: {
            participants: {
              update: {
                where: {
                  conversationId_userId: {
                    conversationId,
                    userId,
                  },
                },
                data: {
                  isAdmin: newAdminStatus,
                },
              },
            },
          },
        });

        await prisma.message.create({
          data: {
            conversationId,
            content: `${session.user.name} ${
              newAdminStatus ? 'promoted' : 'demoted'
            } a group member`,
            senderId: session.user.id,
            type: 'SYSTEM',
          },
        });
        break;

      default:
        return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
    }

    return NextResponse.json(result);
  } catch (error) {
    console.error('Error managing group members:', error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
}

// Leave group
export async function DELETE(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id)
      return new NextResponse('Unauthorized', { status: 401 });

    const { conversationId } = await req.json();
    if (!conversationId) {
      return NextResponse.json(
        { error: 'Conversation ID required' },
        { status: 400 }
      );
    }

    // Check if user is in the group
    const participant = await prisma.conversationParticipant.findUnique({
      where: {
        conversationId_userId: {
          conversationId,
          userId: session.user.id,
        },
      },
    });

    if (!participant) {
      return NextResponse.json(
        { error: 'Not a member of this group' },
        { status: 404 }
      );
    }

    // If user is last admin, require transferring admin rights first
    if (participant.isAdmin) {
      const otherAdmins = await prisma.conversationParticipant.count({
        where: {
          conversationId,
          isAdmin: true,
          userId: { not: session.user.id },
        },
      });

      if (otherAdmins === 0) {
        return NextResponse.json(
          { error: 'Must transfer admin rights before leaving' },
          { status: 400 }
        );
      }
    }

    // Remove user from group
    await prisma.conversationParticipant.delete({
      where: {
        conversationId_userId: {
          conversationId,
          userId: session.user.id,
        },
      },
    });

    // Add system message
    await prisma.message.create({
      data: {
        conversationId,
        content: `${session.user.name} left the group`,
        senderId: session.user.id,
        type: 'SYSTEM',
      },
    });

    return new NextResponse(null, { status: 204 });
  } catch (error) {
    console.error('Error leaving group:', error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
}
