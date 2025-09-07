import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function GET(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id)
    return new NextResponse('Unauthorized', { status: 401 });

  const url = new URL(req.url);
  const query = url.searchParams.get('q');
  const type = url.searchParams.get('type'); // all, posts, events, users, polls
  const limit = Math.min(parseInt(url.searchParams.get('limit') || '20'), 50);

  if (!query) {
    return NextResponse.json(
      { error: 'Search query is required' },
      { status: 400 }
    );
  }

  type Post = {
    id: string;
    title: string | null;
    content: string;
    createdAt: Date;
    author: {
      id: string;
      name: string | null;
      profilePicture: string | null;
    };
    _count: {
      likes: number;
      comments: number;
    };
  };

  type Event = {
    id: string;
    title: string;
    description: string;
    startTime: Date;
    endTime: Date;
    organizer: {
      id: string;
      name: string | null;
      profilePicture: string | null;
    };
    _count: {
      attendees: number;
    };
  };

  type User = {
    id: string;
    name: string | null;
    profilePicture: string | null;
    bio: string | null;
    _count: {
      followers: number;
      following: number;
      posts: number;
    };
  };

  type Poll = {
    id: string;
    question: string;
    endDate: Date;
    createdBy: {
      id: string;
      name: string | null;
      profilePicture: string | null;
    };
    _count: {
      votes: number;
    };
  };

  type SearchResults = {
    posts?: Post[];
    events?: Event[];
    users?: User[];
    polls?: Poll[];
  };

  const results: SearchResults = {};
  const searchPromises: Promise<void>[] = [];

  // Search posts if requested
  if (!type || type === 'all' || type === 'posts') {
    searchPromises.push(
      prisma.post
        .findMany({
          where: {
            OR: [
              { title: { contains: query, mode: 'insensitive' } },
              { content: { contains: query, mode: 'insensitive' } },
            ],
          },
          include: {
            author: {
              select: {
                id: true,
                name: true,
                profilePicture: true,
              },
            },
            _count: {
              select: {
                likes: true,
                comments: true,
              },
            },
          },
          orderBy: { createdAt: 'desc' },
          take: limit,
        })
        .then((posts: Post[]) => {
          results.posts = posts;
        })
    );
  }

  // Search events if requested
  if (!type || type === 'all' || type === 'events') {
    searchPromises.push(
      prisma.event
        .findMany({
          where: {
            OR: [
              { title: { contains: query, mode: 'insensitive' } },
              { description: { contains: query, mode: 'insensitive' } },
            ],
            endTime: { gte: new Date() }, // Only future events
          },
          include: {
            organizer: {
              select: {
                id: true,
                name: true,
                profilePicture: true,
              },
            },
            _count: {
              select: {
                attendees: true,
              },
            },
          },
          orderBy: { startTime: 'asc' },
          take: limit,
        })
        .then((events: Event[]) => {
          results.events = events;
        })
    );
  }

  // Search users if requested
  if (!type || type === 'all' || type === 'users') {
    searchPromises.push(
      prisma.user
        .findMany({
          where: {
            OR: [
              { name: { contains: query, mode: 'insensitive' } },
              { bio: { contains: query, mode: 'insensitive' } },
            ],
          },
          select: {
            id: true,
            name: true,
            profilePicture: true,
            bio: true,
            _count: {
              select: {
                followers: true,
                following: true,
                posts: true,
              },
            },
          },
          orderBy: { createdAt: 'desc' },
          take: limit,
        })
        .then((users: User[]) => {
          results.users = users;
        })
    );
  }

  // Search polls if requested
  if (!type || type === 'all' || type === 'polls') {
    searchPromises.push(
      prisma.poll
        .findMany({
          where: {
            OR: [{ question: { contains: query, mode: 'insensitive' } }],
            endDate: { gte: new Date() }, // Only active polls
          },
          include: {
            createdBy: {
              select: {
                id: true,
                name: true,
                profilePicture: true,
              },
            },
            _count: {
              select: {
                votes: true,
              },
            },
          },
          orderBy: { createdAt: 'desc' },
          take: limit,
        })
        .then((polls: Poll[]) => {
          results.polls = polls;
        })
    );
  }

  // Wait for all searches to complete
  await Promise.all(searchPromises);

  // Calculate total result count
  const totalResults = Object.values(results).reduce(
    (sum, items) => sum + (items?.length || 0),
    0
  );

  return NextResponse.json({
    query,
    totalResults,
    results,
  });
}
