import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function POST(
  req: Request,
  { params }: { params: { eventId: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id)
      return new NextResponse('Unauthorized', { status: 401 });

    const { eventId } = params;
    const { status } = await req.json();

    if (!status || !['ATTENDING', 'DECLINED'].includes(status)) {
      return NextResponse.json(
        { error: 'Valid status (ATTENDING or DECLINED) is required' },
        { status: 400 }
      );
    }

    // Verify event exists and user is invited
    const event = await prisma.event.findFirst({
      where: {
        id: eventId,
        attendees: {
          some: {
            userId: session.user.id,
          },
        },
      },
      include: {
        attendees: true,
        _count: {
          select: {
            attendees: {
              where: {
                status: 'ATTENDING',
              },
            },
          },
        },
      },
    });

    if (!event) {
      return NextResponse.json(
        { error: 'Event not found or not invited' },
        { status: 404 }
      );
    }

    // Check if event is full when trying to attend
    if (
      status === 'ATTENDING' &&
      event.maxAttendees &&
      event._count.attendees >= event.maxAttendees
    ) {
      return NextResponse.json(
        { error: 'Event is at maximum capacity' },
        { status: 400 }
      );
    }

    // Check if event is in the past
    if (new Date(event.startTime) < new Date()) {
      return NextResponse.json(
        { error: 'Cannot RSVP to past events' },
        { status: 400 }
      );
    }

    // Update attendance status
    const attendance = await prisma.eventAttendee.update({
      where: {
        eventId_userId: {
          eventId,
          userId: session.user.id,
        },
      },
      data: {
        status,
        updatedAt: new Date(),
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            profilePicture: true,
          },
        },
      },
    });

    return NextResponse.json(attendance);
  } catch (error) {
    console.error('Error updating RSVP:', error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
}
