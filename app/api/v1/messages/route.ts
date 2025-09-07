import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function GET(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id)
    return new NextResponse('Unauthorized', { status: 401 });

  const url = new URL(req.url);
  const conversationId = url.searchParams.get('conversationId');
  const participantId = url.searchParams.get('participantId');
  const before = url.searchParams.get('before');
  const limit = Math.min(parseInt(url.searchParams.get('limit') || '50'), 100);

  if (!conversationId && !participantId) {
    return NextResponse.json(
      { error: 'Either conversationId or participantId is required' },
      { status: 400 }
    );
  }

  // If participantId is provided, find or create conversation
  let targetConversationId = conversationId;
  if (participantId) {
    const existingConversation = await prisma.conversation.findFirst({
      where: {
        AND: [
          {
            participants: {
              some: {
                userId: session.user.id,
              },
            },
          },
          {
            participants: {
              some: {
                userId: participantId,
              },
            },
          },
          { type: 'DIRECT' },
        ],
      },
    });

    if (existingConversation) {
      targetConversationId = existingConversation.id;
    } else {
      const newConversation = await prisma.conversation.create({
        data: {
          type: 'DIRECT',
          participants: {
            create: [{ userId: session.user.id }, { userId: participantId }],
          },
        },
      });
      targetConversationId = newConversation.id;
    }
  }

  // Verify user has access to conversation
  const conversation = await prisma.conversation.findFirst({
    where: {
      id: targetConversationId,
      participants: {
        some: {
          userId: session.user.id,
        },
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

  if (!conversation) {
    return NextResponse.json(
      { error: 'Conversation not found' },
      { status: 404 }
    );
  }

  // Fetch messages with pagination
  const whereClause: any = {
    conversationId: targetConversationId,
  };

  if (before) {
    whereClause.createdAt = { lt: new Date(before) };
  }

  const messages = await prisma.message.findMany({
    where: whereClause,
    include: {
      sender: {
        select: {
          id: true,
          name: true,
          email: true,
          profilePicture: true,
        },
      },
      reactions: true,
    },
    orderBy: {
      createdAt: 'desc',
    },
    take: limit,
  });

  // Mark messages as read
  await prisma.message.updateMany({
    where: {
      conversationId: targetConversationId,
      senderId: { not: session.user.id },
      readBy: { none: { userId: session.user.id } },
    },
    data: {
      readBy: {
        create: {
          userId: session.user.id,
          readAt: new Date(),
        },
      },
    },
  });

  // Get the earliest timestamp for pagination
  const nextCursor =
    messages.length === limit
      ? messages[messages.length - 1].createdAt.toISOString()
      : null;

  return NextResponse.json({
    conversation,
    messages: messages.reverse(), // Return in chronological order
    nextCursor,
  });
}

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id)
      return new NextResponse('Unauthorized', { status: 401 });

    const data = await req.json();
    const { conversationId, content, replyToId } = data;

    if (!conversationId || !content) {
      return NextResponse.json(
        { error: 'Conversation ID and content are required' },
        { status: 400 }
      );
    }

    // Verify user has access to conversation
    const hasAccess = await prisma.conversation.findFirst({
      where: {
        id: conversationId,
        participants: {
          some: {
            userId: session.user.id,
          },
        },
      },
    });

    if (!hasAccess) {
      return NextResponse.json(
        { error: 'Conversation not found' },
        { status: 404 }
      );
    }

    // Create message
    const message = await prisma.message.create({
      data: {
        content,
        conversationId,
        senderId: session.user.id,
        replyToId,
        readBy: {
          create: {
            userId: session.user.id,
            readAt: new Date(),
          },
        },
      },
      include: {
        sender: {
          select: {
            id: true,
            name: true,
            email: true,
            profilePicture: true,
          },
        },
        reactions: true,
      },
    });

    return NextResponse.json(message, { status: 201 });
  } catch (error) {
    console.error('Error sending message:', error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
}

// Add reaction to message
export async function PUT(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id)
      return new NextResponse('Unauthorized', { status: 401 });

    const data = await req.json();
    const { messageId, emoji } = data;

    if (!messageId || !emoji) {
      return NextResponse.json(
        { error: 'Message ID and emoji are required' },
        { status: 400 }
      );
    }

    // Verify user has access to the message's conversation
    const message = await prisma.message.findFirst({
      where: {
        id: messageId,
        conversation: {
          participants: {
            some: {
              userId: session.user.id,
            },
          },
        },
      },
    });

    if (!message) {
      return NextResponse.json({ error: 'Message not found' }, { status: 404 });
    }

    // Add or update reaction
    const reaction = await prisma.messageReaction.upsert({
      where: {
        messageId_userId: {
          messageId,
          userId: session.user.id,
        },
      },
      create: {
        messageId,
        userId: session.user.id,
        emoji,
      },
      update: {
        emoji,
      },
    });

    return NextResponse.json(reaction);
  } catch (error) {
    console.error('Error adding reaction:', error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
}
