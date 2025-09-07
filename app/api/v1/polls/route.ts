import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

interface PollOption {
  id: string;
  text: string;
  votes: Array<{ userId: string }>;
}

interface Poll {
  id: string;
  question: string;
  endDate: Date;
  options: PollOption[];
  _count: {
    votes: number;
  };
  createdById: string;
}

interface Vote {
  userId: string;
}

export async function GET(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id)
    return new NextResponse('Unauthorized', { status: 401 });

  const url = new URL(req.url);
  const status = url.searchParams.get('status'); // active, closed, all
  const before = url.searchParams.get('before');
  const limit = Math.min(parseInt(url.searchParams.get('limit') || '20'), 50);

  const whereClause: any = {
    OR: [
      { createdById: session.user.id }, // Created by user
      { isPublic: true }, // Public polls
    ],
  };

  if (status === 'active') {
    whereClause.endDate = { gt: new Date() };
  } else if (status === 'closed') {
    whereClause.endDate = { lte: new Date() };
  }

  if (before) {
    whereClause.createdAt = { lt: new Date(before) };
  }

  const polls = await prisma.poll.findMany({
    where: whereClause,
    include: {
      createdBy: {
        select: {
          id: true,
          name: true,
          profilePicture: true,
        },
      },
      options: {
        include: {
          votes: {
            select: {
              userId: true,
            },
          },
        },
      },
      _count: {
        select: {
          votes: true,
        },
      },
    },
    orderBy: {
      createdAt: 'desc',
    },
    take: limit,
  });

  // Format polls and calculate vote percentages
  const userId = session?.user?.id || '';
  const formattedPolls = polls.map((poll: Poll) => {
    const totalVotes = poll._count.votes;
    const userVote = poll.options.find((opt: PollOption) =>
      opt.votes.some((vote: Vote) => vote.userId === userId)
    );

    return {
      ...poll,
      options: poll.options.map((opt: PollOption) => ({
        id: opt.id,
        text: opt.text,
        voteCount: opt.votes.length,
        percentage: totalVotes > 0 ? (opt.votes.length / totalVotes) * 100 : 0,
        hasUserVoted: opt.votes.some((vote: Vote) => vote.userId === userId),
      })),
      userHasVoted: !!userVote,
      totalVotes,
      isActive: poll.endDate > new Date(),
    };
  });

  const nextCursor =
    polls.length === limit
      ? polls[polls.length - 1].createdAt.toISOString()
      : null;

  return NextResponse.json({
    polls: formattedPolls,
    nextCursor,
  });
}

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id)
      return new NextResponse('Unauthorized', { status: 401 });

    const data = await req.json();
    const { question, options, endDate, isPublic = true } = data;

    if (!question || !options || options.length < 2 || !endDate) {
      return NextResponse.json(
        { error: 'Question, at least 2 options, and end date required' },
        { status: 400 }
      );
    }

    const poll = await prisma.poll.create({
      data: {
        question,
        endDate: new Date(endDate),
        isPublic,
        createdById: session.user.id,
        options: {
          create: options.map((opt: PollOption) => ({
            text: opt.text,
          })),
        },
      },
      include: {
        options: true,
        createdBy: {
          select: {
            id: true,
            name: true,
            profilePicture: true,
          },
        },
      },
    });

    return NextResponse.json(poll, { status: 201 });
  } catch (error) {
    console.error('Error creating poll:', error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
}

// Vote on a poll
export async function PUT(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id)
      return new NextResponse('Unauthorized', { status: 401 });

    const data = await req.json();
    const { pollId, optionId } = data;

    if (!pollId || !optionId) {
      return NextResponse.json(
        { error: 'Poll ID and option ID required' },
        { status: 400 }
      );
    }

    // Check if poll is still active
    const poll = await prisma.poll.findUnique({
      where: { id: pollId },
      include: { options: true },
    });

    if (!poll) {
      return NextResponse.json({ error: 'Poll not found' }, { status: 404 });
    }

    if (poll.endDate <= new Date()) {
      return NextResponse.json({ error: 'Poll has ended' }, { status: 400 });
    }

    // Check if option belongs to poll
    if (!poll.options.some((opt: PollOption) => opt.id === optionId)) {
      return NextResponse.json(
        { error: 'Invalid option for this poll' },
        { status: 400 }
      );
    }

    // Remove any existing votes by this user on this poll
    await prisma.vote.deleteMany({
      where: {
        userId: session.user.id,
        option: {
          pollId,
        },
      },
    });

    // Add new vote
    const vote = await prisma.vote.create({
      data: {
        optionId,
        userId: session.user.id,
      },
    });

    return NextResponse.json(vote);
  } catch (error) {
    console.error('Error voting on poll:', error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
}

// Close poll early (if creator)
export async function DELETE(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id)
      return new NextResponse('Unauthorized', { status: 401 });

    const { pollId } = await req.json();
    if (!pollId) {
      return NextResponse.json({ error: 'Poll ID required' }, { status: 400 });
    }

    const poll = await prisma.poll.findUnique({
      where: { id: pollId },
    });

    if (!poll) {
      return NextResponse.json({ error: 'Poll not found' }, { status: 404 });
    }

    if (poll.createdById !== session.user.id) {
      return NextResponse.json(
        { error: 'Not authorized to close this poll' },
        { status: 403 }
      );
    }

    // Close poll by setting end date to now
    const closedPoll = await prisma.poll.update({
      where: { id: pollId },
      data: {
        endDate: new Date(),
      },
    });

    return NextResponse.json(closedPoll);
  } catch (error) {
    console.error('Error closing poll:', error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
}
