import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth'; // Assuming this path for auth options
import { prisma } from '@/lib/prisma'; // Assuming this path for prisma client

export async function GET() {
  try {
    const session = await getServerSession(authOptions);

    if (!session || !session.user) {
      return new NextResponse('Unauthorized', { status: 401 });
    }

    const userId = session.user.id;

    const changelogs = await prisma.changelog.findMany({
      orderBy: {
        publishedAt: 'desc',
      },
      include: {
        seenByUsers: {
          where: {
            userId: userId,
          },
          select: {
            seenAt: true,
          },
        },
      },
    });

    const changelogsWithSeenStatus = changelogs.map((changelog) => ({
      ...changelog,
      isSeen: changelog.seenByUsers.length > 0,
      seenAt: changelog.seenByUsers.length > 0 ? changelog.seenByUsers[0].seenAt : null,
    }));

    return NextResponse.json(changelogsWithSeenStatus);
  } catch (error) {
    console.error('Error fetching changelogs:', error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || !session.user) {
      return new NextResponse('Unauthorized', { status: 401 });
    }

    const userId = session.user.id;
    const { changelogId } = await req.json();

    if (!changelogId) {
      return new NextResponse('Changelog ID is required', { status: 400 });
    }

    await prisma.userChangelogSeen.upsert({
      where: {
        userId_changelogId: {
          userId: userId,
          changelogId: changelogId,
        },
      },
      update: {
        seenAt: new Date(),
      },
      create: {
        userId: userId,
        changelogId: changelogId,
      },
    });

    return new NextResponse('Changelog marked as seen', { status: 200 });
  } catch (error) {
    console.error('Error marking changelog as seen:', error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
}
