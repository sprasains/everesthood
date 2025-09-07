import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function GET(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id)
    return new NextResponse('Unauthorized', { status: 401 });

  const url = new URL(req.url);
  const before = url.searchParams.get('before');
  const type = url.searchParams.get('type'); // post, comment, achievement, friend
  const limit = Math.min(parseInt(url.searchParams.get('limit') || '20'), 50);

  interface Friendship {
    requesterId: string;
    receiverId: string;
    status: string;
  }

  // Get user's friends to include their activity
  const friendships = await prisma.friendship.findMany({
    where: {
      OR: [
        { requesterId: session.user.id, status: 'ACCEPTED' },
        { receiverId: session.user.id, status: 'ACCEPTED' },
      ],
    },
  });

  const userId = session.user.id;
  const friendIds = friendships.map((f: Friendship) =>
    f.requesterId === userId ? f.receiverId : f.requesterId
  );

  // Build activity query conditions
  const whereClause: any = {
    OR: [
      { userId: session.user.id }, // User's own activity
      { userId: { in: friendIds } }, // Friends' activity
    ],
  };

  if (before) {
    whereClause.createdAt = { lt: new Date(before) };
  }

  if (type) {
    whereClause.type = type.toUpperCase();
  }

  const activities = await prisma.activity.findMany({
    where: whereClause,
    include: {
      user: {
        select: {
          id: true,
          name: true,
          email: true,
          profilePicture: true,
        },
      },
      post: {
        select: {
          id: true,
          title: true,
          content: true,
          _count: {
            select: {
              likes: true,
              comments: true,
            },
          },
        },
      },
      comment: {
        select: {
          id: true,
          content: true,
          post: {
            select: {
              id: true,
              title: true,
            },
          },
        },
      },
      achievement: {
        select: {
          id: true,
          name: true,
          description: true,
          icon: true,
        },
      },
    },
    orderBy: {
      createdAt: 'desc',
    },
    take: limit,
  });

  // Define activity interfaces
  interface ActivityUser {
    id: string;
    name: string;
    email: string;
    profilePicture: string | null;
  }

  interface ActivityPost {
    id: string;
    title: string;
    content: string;
    _count: {
      likes: number;
      comments: number;
    };
  }

  interface ActivityComment {
    id: string;
    content: string;
    post: {
      id: string;
      title: string;
    };
  }

  interface ActivityAchievement {
    id: string;
    name: string;
    description: string;
    icon: string;
  }

  interface Activity {
    id: string;
    type: string;
    createdAt: Date;
    user: ActivityUser;
    post?: ActivityPost;
    comment?: ActivityComment;
    achievement?: ActivityAchievement;
  }

  interface FormattedActivity {
    id: string;
    type: string;
    createdAt: Date;
    user: {
      id: string;
      name: string;
      profilePicture?: string;
    };
    content: {
      title?: string;
      body?: string;
      metrics?: {
        likes?: number;
        comments?: number;
      };
      achievement?: {
        name: string;
        description: string;
        icon: string;
      };
      post?: {
        id: string;
        title: string;
      };
    };
  }

  const formattedActivities: FormattedActivity[] = activities.map(
    (activity: Activity) => {
      const base = {
        id: activity.id,
        type: activity.type,
        createdAt: activity.createdAt,
        user: {
          id: activity.user.id,
          name: activity.user.name,
          profilePicture: activity.user.profilePicture || undefined,
        },
        content: {},
      };

      switch (activity.type) {
        case 'POST':
          if (activity.post) {
            base.content = {
              title: activity.post.title,
              body: activity.post.content,
              metrics: {
                likes: activity.post._count.likes,
                comments: activity.post._count.comments,
              },
            };
          }
          break;

        case 'COMMENT':
          if (activity.comment) {
            base.content = {
              body: activity.comment.content,
              post: {
                id: activity.comment.post.id,
                title: activity.comment.post.title,
              },
            };
          }
          break;

        case 'ACHIEVEMENT':
          if (activity.achievement) {
            base.content = {
              achievement: {
                name: activity.achievement.name,
                description: activity.achievement.description,
                icon: activity.achievement.icon,
              },
            };
          }
          break;
      }

      return base;
    }
  );

  // Get the earliest timestamp for pagination
  const nextCursor =
    activities.length === limit
      ? activities[activities.length - 1].createdAt.toISOString()
      : null;

  return NextResponse.json({
    activities: formattedActivities,
    nextCursor,
  });
}
