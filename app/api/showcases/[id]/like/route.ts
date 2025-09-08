import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Check if user already liked this showcase
    const existingLike = await prisma.showcaseLike.findFirst({
      where: {
        showcaseId: params.id,
        userId: session.user.id,
      },
    });

    if (existingLike) {
      // Unlike
      await prisma.showcaseLike.delete({
        where: {
          id: existingLike.id,
        },
      });

      // Update showcase like count
      await prisma.showcase.update({
        where: { id: params.id },
        data: {
          likes: {
            decrement: 1,
          },
        },
      });

      return NextResponse.json({ liked: false });
    } else {
      // Like
      await prisma.showcaseLike.create({
        data: {
          showcaseId: params.id,
          userId: session.user.id,
        },
      });

      // Update showcase like count
      await prisma.showcase.update({
        where: { id: params.id },
        data: {
          likes: {
            increment: 1,
          },
        },
      });

      return NextResponse.json({ liked: true });
    }
  } catch (error) {
    console.error('Error toggling showcase like:', error);
    return NextResponse.json(
      { error: 'Failed to toggle like' },
      { status: 500 }
    );
  }
}
