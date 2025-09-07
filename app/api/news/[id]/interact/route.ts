import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { z } from 'zod';

const interactSchema = z.object({
  type: z.enum(['like', 'share', 'bookmark']),
});

// POST /api/news/[id]/interact - Interact with news article
export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { type } = interactSchema.parse(body);

    // Check if article exists
    const article = await prisma.newsArticle.findUnique({
      where: { id: params.id }
    });

    if (!article) {
      return NextResponse.json({ error: 'Article not found' }, { status: 404 });
    }

    if (type === 'bookmark') {
      // Handle bookmark toggle
      const existingBookmark = await prisma.newsBookmark.findUnique({
        where: {
          articleId_userId: {
            articleId: params.id,
            userId: session.user.id
          }
        }
      });

      if (existingBookmark) {
        // Remove bookmark
        await prisma.newsBookmark.delete({
          where: {
            articleId_userId: {
              articleId: params.id,
              userId: session.user.id
            }
          }
        });

        return NextResponse.json({ 
          bookmarked: false, 
          message: 'Bookmark removed' 
        });
      } else {
        // Add bookmark
        await prisma.newsBookmark.create({
          data: {
            articleId: params.id,
            userId: session.user.id
          }
        });

        return NextResponse.json({ 
          bookmarked: true, 
          message: 'Article bookmarked' 
        });
      }
    } else {
      // Handle like/share toggle
      const existingInteraction = await prisma.newsInteraction.findUnique({
        where: {
          articleId_userId_type: {
            articleId: params.id,
            userId: session.user.id,
            type: type
          }
        }
      });

      if (existingInteraction) {
        // Remove interaction
        await prisma.newsInteraction.delete({
          where: {
            articleId_userId_type: {
              articleId: params.id,
              userId: session.user.id,
              type: type
            }
          }
        });

        // Update article counts
        const updateData: any = {};
        if (type === 'like') {
          updateData.likeCount = { decrement: 1 };
        } else if (type === 'share') {
          updateData.shareCount = { decrement: 1 };
        }

        await prisma.newsArticle.update({
          where: { id: params.id },
          data: updateData
        });

        return NextResponse.json({ 
          [type]: false, 
          message: `${type} removed` 
        });
      } else {
        // Add interaction
        await prisma.newsInteraction.create({
          data: {
            articleId: params.id,
            userId: session.user.id,
            type: type
          }
        });

        // Update article counts
        const updateData: any = {};
        if (type === 'like') {
          updateData.likeCount = { increment: 1 };
        } else if (type === 'share') {
          updateData.shareCount = { increment: 1 };
        }

        await prisma.newsArticle.update({
          where: { id: params.id },
          data: updateData
        });

        return NextResponse.json({ 
          [type]: true, 
          message: `Article ${type}d` 
        });
      }
    }

  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid input', details: error.errors },
        { status: 400 }
      );
    }

    console.error('Error interacting with news article:', error);
    return NextResponse.json(
      { error: 'Failed to interact with article' },
      { status: 500 }
    );
  }
}
