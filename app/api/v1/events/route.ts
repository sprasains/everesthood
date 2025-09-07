import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

interface EventAttendee {
  userId: string;
  status: 'INVITED' | 'ATTENDING' | 'DECLINED';
  user: {
    id: string;
    name: string;
    profilePicture: string | null;
  };
}

interface Event {
  id: string;
  title: string;
  startTime: Date;
  endTime: Date;
  organizerId: string;
  status: string;
  type: 'IN_PERSON' | 'VIRTUAL';
  attendees: EventAttendee[];
  _count: {
    attendees: number;
  };
}

export async function GET(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id)
    return new NextResponse('Unauthorized', { status: 401 });

  const url = new URL(req.url);
  const type = url.searchParams.get('type'); // hosting, attending, invited, all
  const timeframe = url.searchParams.get('timeframe'); // upcoming, past, all
  const before = url.searchParams.get('before');
  const limit = Math.min(parseInt(url.searchParams.get('limit') || '20'), 50);

  // Build where clause based on filters
  const whereClause: any = {};
  const now = new Date();

  // Type filter
  if (type === 'hosting') {
    whereClause.organizerId = session.user.id;
  } else if (type === 'attending') {
    whereClause.attendees = {
      some: {
        userId: session.user.id,
        status: 'ATTENDING',
      },
    };
  } else if (type === 'invited') {
    whereClause.attendees = {
      some: {
        userId: session.user.id,
        status: 'INVITED',
      },
    };
  } else {
    // Show events user is involved with
    whereClause.OR = [
      { organizerId: session.user.id },
      {
        attendees: {
          some: {
            userId: session.user.id,
          },
        },
      },
    ];
  }

  // Timeframe filter
  if (timeframe === 'upcoming') {
    whereClause.startTime = { gte: now };
  } else if (timeframe === 'past') {
    whereClause.startTime = { lt: now };
  }

  // Cursor pagination
  if (before) {
    whereClause.createdAt = { lt: new Date(before) };
  }

  const events = await prisma.event.findMany({
    where: whereClause,
    include: {
      organizer: {
        select: {
          id: true,
          name: true,
          profilePicture: true,
        },
      },
      attendees: {
        include: {
          user: {
            select: {
              id: true,
              name: true,
              profilePicture: true,
            },
          },
        },
      },
      _count: {
        select: {
          attendees: true,
        },
      },
    },
    orderBy: [{ startTime: 'asc' }, { createdAt: 'desc' }],
    take: limit,
  });

  // Format events with attendance stats
  const userId = session?.user?.id || '';
  const formattedEvents = events.map((event: Event) => {
    const attending = event.attendees.filter(
      (a: EventAttendee) => a.status === 'ATTENDING'
    ).length;
    const invited = event.attendees.filter(
      (a: EventAttendee) => a.status === 'INVITED'
    ).length;
    const declined = event.attendees.filter(
      (a: EventAttendee) => a.status === 'DECLINED'
    ).length;
    const userStatus =
      event.attendees.find((a: EventAttendee) => a.userId === userId)?.status ||
      'NOT_INVITED';

    return {
      ...event,
      stats: {
        attending,
        invited,
        declined,
        total: event._count.attendees,
      },
      userStatus,
      isPast: event.startTime < now,
      canEdit: event.organizerId === userId,
      attendees: event.attendees.map((a: EventAttendee) => ({
        id: a.user.id,
        name: a.user.name,
        profilePicture: a.user.profilePicture,
        status: a.status,
      })),
    };
  });

  const nextCursor =
    events.length === limit
      ? events[events.length - 1].createdAt.toISOString()
      : null;

  return NextResponse.json({
    events: formattedEvents,
    nextCursor,
  });
}

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id)
      return new NextResponse('Unauthorized', { status: 401 });

    const data = await req.json();
    const {
      title,
      description,
      startTime,
      endTime,
      type,
      location,
      meetingUrl,
      maxAttendees,
      inviteeIds = [],
    } = data;

    // Validation
    if (!title || !startTime || !endTime || !type) {
      return NextResponse.json(
        { error: 'Title, start time, end time, and type are required' },
        { status: 400 }
      );
    }

    if (new Date(startTime) >= new Date(endTime)) {
      return NextResponse.json(
        { error: 'End time must be after start time' },
        { status: 400 }
      );
    }

    if (type === 'IN_PERSON' && !location) {
      return NextResponse.json(
        { error: 'Location is required for in-person events' },
        { status: 400 }
      );
    }

    if (type === 'VIRTUAL' && !meetingUrl) {
      return NextResponse.json(
        { error: 'Meeting URL is required for virtual events' },
        { status: 400 }
      );
    }

    // Create event with invitees
    const event = await prisma.event.create({
      data: {
        title,
        description,
        startTime: new Date(startTime),
        endTime: new Date(endTime),
        type,
        location,
        meetingUrl,
        maxAttendees,
        organizerId: session.user.id,
        attendees: {
          create: inviteeIds.map((userId: string) => ({
            userId,
            status: 'INVITED',
          })),
        },
      },
      include: {
        organizer: {
          select: {
            id: true,
            name: true,
            profilePicture: true,
          },
        },
        attendees: {
          include: {
            user: {
              select: {
                id: true,
                name: true,
                profilePicture: true,
              },
            },
          },
        },
      },
    });

    return NextResponse.json(event, { status: 201 });
  } catch (error) {
    console.error('Error creating event:', error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
}

export async function PUT(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id)
      return new NextResponse('Unauthorized', { status: 401 });

    const data = await req.json();
    const {
      eventId,
      title,
      description,
      startTime,
      endTime,
      type,
      location,
      meetingUrl,
      maxAttendees,
    } = data;

    if (!eventId) {
      return NextResponse.json(
        { error: 'Event ID is required' },
        { status: 400 }
      );
    }

    // Verify ownership
    const event = await prisma.event.findUnique({
      where: { id: eventId },
    });

    if (!event) {
      return NextResponse.json({ error: 'Event not found' }, { status: 404 });
    }

    if (event.organizerId !== session.user.id) {
      return NextResponse.json(
        { error: 'Not authorized to update this event' },
        { status: 403 }
      );
    }

    // Update event
    const updatedEvent = await prisma.event.update({
      where: { id: eventId },
      data: {
        title,
        description,
        startTime: startTime ? new Date(startTime) : undefined,
        endTime: endTime ? new Date(endTime) : undefined,
        type,
        location,
        meetingUrl,
        maxAttendees,
      },
      include: {
        organizer: {
          select: {
            id: true,
            name: true,
            profilePicture: true,
          },
        },
        attendees: {
          include: {
            user: {
              select: {
                id: true,
                name: true,
                profilePicture: true,
              },
            },
          },
        },
      },
    });

    return NextResponse.json(updatedEvent);
  } catch (error) {
    console.error('Error updating event:', error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
}

// Cancel event
export async function DELETE(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id)
      return new NextResponse('Unauthorized', { status: 401 });

    const { eventId } = await req.json();
    if (!eventId) {
      return NextResponse.json(
        { error: 'Event ID is required' },
        { status: 400 }
      );
    }

    // Verify ownership
    const event = await prisma.event.findUnique({
      where: { id: eventId },
    });

    if (!event) {
      return NextResponse.json({ error: 'Event not found' }, { status: 404 });
    }

    if (event.organizerId !== session.user.id) {
      return NextResponse.json(
        { error: 'Not authorized to cancel this event' },
        { status: 403 }
      );
    }

    // Soft delete by marking as cancelled
    const cancelledEvent = await prisma.event.update({
      where: { id: eventId },
      data: {
        status: 'CANCELLED',
        cancelledAt: new Date(),
      },
    });

    return NextResponse.json(cancelledEvent);
  } catch (error) {
    console.error('Error cancelling event:', error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
}
