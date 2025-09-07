import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

// GET /api/news/[id] - Get specific news article
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const article = await prisma.newsArticle.findUnique({
      where: { id: params.id },
      include: {
        source: {
          select: {
            id: true,
            name: true,
            url: true,
            description: true
          }
        },
        interactions: {
          where: { userId: session.user.id },
          select: {
            type: true,
            createdAt: true
          }
        },
        _count: {
          select: {
            interactions: true,
            bookmarks: true
          }
        }
      }
    });

    if (!article) {
      return NextResponse.json({ error: 'Article not found' }, { status: 404 });
    }

    // Increment view count
    await prisma.newsArticle.update({
      where: { id: params.id },
      data: { viewCount: { increment: 1 } }
    });

    // Record view interaction
    await prisma.newsInteraction.upsert({
      where: {
        articleId_userId_type: {
          articleId: params.id,
          userId: session.user.id,
          type: 'view'
        }
      },
      update: {
        createdAt: new Date()
      },
      create: {
        articleId: params.id,
        userId: session.user.id,
        type: 'view'
      }
    });

    // Check if user has bookmarked this article
    const userBookmark = await prisma.newsBookmark.findUnique({
      where: {
        articleId_userId: {
          articleId: params.id,
          userId: session.user.id
        }
      }
    });

    const userInteractions = {
      isBookmarked: !!userBookmark,
      isLiked: article.interactions.some(i => i.type === 'like'),
      isShared: article.interactions.some(i => i.type === 'share')
    };

    return NextResponse.json({
      ...article,
      userInteractions
    });

  } catch (error) {
    console.error('Error fetching news article:', error);
    return NextResponse.json(
      { error: 'Failed to fetch news article' },
      { status: 500 }
    );
  }
}
