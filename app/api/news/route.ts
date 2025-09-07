import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { z } from 'zod';

// GET /api/news - Get personalized news feed
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '20');
    const category = searchParams.get('category') || '';
    const source = searchParams.get('source') || '';
    const featured = searchParams.get('featured') === 'true';
    const trending = searchParams.get('trending') === 'true';
    const sortBy = searchParams.get('sortBy') || 'publishedAt';
    const sortOrder = searchParams.get('sortOrder') || 'desc';

    const skip = (page - 1) * limit;

    // Get user preferences
    const userPreferences = await prisma.userNewsPreference.findUnique({
      where: { userId: session.user.id }
    });

    // Build where clause based on user preferences and filters
    const where: any = {
      status: 'PUBLISHED'
    };

    if (featured) {
      where.isFeatured = true;
    }

    if (trending) {
      where.isTrending = true;
    }

    if (category) {
      where.category = category;
    } else if (userPreferences?.categories.length) {
      where.category = { in: userPreferences.categories };
    }

    if (source) {
      where.sourceId = source;
    } else if (userPreferences?.sources.length) {
      where.sourceId = { in: userPreferences.sources };
    }

    // Build orderBy clause
    const orderBy: any = {};
    orderBy[sortBy] = sortOrder;

    const [articles, total] = await Promise.all([
      prisma.newsArticle.findMany({
        where,
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
        },
        orderBy,
        skip,
        take: limit
      }),
      prisma.newsArticle.count({ where })
    ]);

    // Get user interactions for these articles
    const articleIds = articles.map(article => article.id);
    const userInteractions = await prisma.newsInteraction.findMany({
      where: {
        articleId: { in: articleIds },
        userId: session.user.id
      }
    });

    const userBookmarks = await prisma.newsBookmark.findMany({
      where: {
        articleId: { in: articleIds },
        userId: session.user.id
      }
    });

    // Add user interaction data to articles
    const articlesWithInteractions = articles.map(article => {
      const interactions = userInteractions.filter(i => i.articleId === article.id);
      const isBookmarked = userBookmarks.some(b => b.articleId === article.id);
      const isLiked = interactions.some(i => i.type === 'like');
      const isShared = interactions.some(i => i.type === 'share');

      return {
        ...article,
        userInteractions: {
          isBookmarked,
          isLiked,
          isShared
        }
      };
    });

    return NextResponse.json({
      articles: articlesWithInteractions,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    });

  } catch (error) {
    console.error('Error fetching news:', error);
    return NextResponse.json(
      { error: 'Failed to fetch news' },
      { status: 500 }
    );
  }
}
