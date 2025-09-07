import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

// POST /api/guides/[id]/bookmark - Toggle bookmark for guide
export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Check if guide exists
    const guide = await prisma.guide.findUnique({
      where: { id: params.id }
    });

    if (!guide) {
      return NextResponse.json({ error: 'Guide not found' }, { status: 404 });
    }

    // Check if bookmark already exists
    const existingBookmark = await prisma.guideBookmark.findUnique({
      where: {
        guideId_userId: {
          guideId: params.id,
          userId: session.user.id
        }
      }
    });

    if (existingBookmark) {
      // Remove bookmark
      await prisma.guideBookmark.delete({
        where: {
          guideId_userId: {
            guideId: params.id,
            userId: session.user.id
          }
        }
      });

      return NextResponse.json({ bookmarked: false, message: 'Bookmark removed' });
    } else {
      // Add bookmark
      await prisma.guideBookmark.create({
        data: {
          guideId: params.id,
          userId: session.user.id
        }
      });

      return NextResponse.json({ bookmarked: true, message: 'Guide bookmarked' });
    }

  } catch (error) {
    console.error('Error toggling bookmark:', error);
    return NextResponse.json(
      { error: 'Failed to toggle bookmark' },
      { status: 500 }
    );
  }
}
