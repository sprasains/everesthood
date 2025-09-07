import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

// GET /api/news/bookmarks - Get user's bookmarked articles
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '20');
    const skip = (page - 1) * limit;

    const [bookmarks, total] = await Promise.all([
      prisma.newsBookmark.findMany({
        where: { userId: session.user.id },
        include: {
          article: {
            include: {
              source: {
                select: {
                  id: true,
                  name: true,
                  url: true
                }
              },
              _count: {
                select: {
                  interactions: true,
                  bookmarks: true
                }
              }
            }
          }
        },
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit
      }),
      prisma.newsBookmark.count({
        where: { userId: session.user.id }
      })
    ]);

    // Get user interactions for these articles
    const articleIds = bookmarks.map(bookmark => bookmark.article.id);
    const userInteractions = await prisma.newsInteraction.findMany({
      where: {
        articleId: { in: articleIds },
        userId: session.user.id
      }
    });

    // Add user interaction data to articles
    const bookmarksWithInteractions = bookmarks.map(bookmark => {
      const interactions = userInteractions.filter(i => i.articleId === bookmark.article.id);
      const isLiked = interactions.some(i => i.type === 'like');
      const isShared = interactions.some(i => i.type === 'share');

      return {
        ...bookmark,
        article: {
          ...bookmark.article,
          userInteractions: {
            isBookmarked: true,
            isLiked,
            isShared
          }
        }
      };
    });

    return NextResponse.json({
      bookmarks: bookmarksWithInteractions,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    });

  } catch (error) {
    console.error('Error fetching bookmarked articles:', error);
    return NextResponse.json(
      { error: 'Failed to fetch bookmarked articles' },
      { status: 500 }
    );
  }
}
