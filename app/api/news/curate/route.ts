import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { z } from 'zod';

const curateSchema = z.object({
  action: z.enum(['feature', 'trending', 'archive', 'unfeature', 'untrending', 'unarchive']),
  articleIds: z.array(z.string()).min(1),
  reason: z.string().optional(),
});

// POST /api/news/curate - Curate news articles (admin only)
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Check if user is admin
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { role: true }
    });

    if (user?.role !== 'ADMIN' && user?.role !== 'SUPER_ADMIN') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const body = await request.json();
    const { action, articleIds, reason } = curateSchema.parse(body);

    let updateData: any = {};
    let logMessage = '';

    switch (action) {
      case 'feature':
        updateData = { isFeatured: true };
        logMessage = 'Featured articles';
        break;
      case 'unfeature':
        updateData = { isFeatured: false };
        logMessage = 'Unfeatured articles';
        break;
      case 'trending':
        updateData = { isTrending: true };
        logMessage = 'Marked articles as trending';
        break;
      case 'untrending':
        updateData = { isTrending: false };
        logMessage = 'Removed trending status from articles';
        break;
      case 'archive':
        updateData = { status: 'ARCHIVED' };
        logMessage = 'Archived articles';
        break;
      case 'unarchive':
        updateData = { status: 'PUBLISHED' };
        logMessage = 'Unarchived articles';
        break;
    }

    // Update articles
    const result = await prisma.newsArticle.updateMany({
      where: {
        id: { in: articleIds }
      },
      data: updateData
    });

    // Log curation action
    console.log(`Admin ${session.user.id} ${logMessage}: ${articleIds.join(', ')}${reason ? ` - Reason: ${reason}` : ''}`);

    return NextResponse.json({
      message: logMessage,
      updatedCount: result.count,
      articleIds
    });

  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid input', details: error.errors },
        { status: 400 }
      );
    }

    console.error('Error curating news articles:', error);
    return NextResponse.json(
      { error: 'Failed to curate articles' },
      { status: 500 }
    );
  }
}

// GET /api/news/curate - Get curation queue and statistics
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Check if user is admin
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { role: true }
    });

    if (user?.role !== 'ADMIN' && user?.role !== 'SUPER_ADMIN') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const { searchParams } = new URL(request.url);
    const type = searchParams.get('type') || 'queue'; // 'queue', 'stats', 'trending'

    switch (type) {
      case 'queue':
        return await getCurationQueue();
      case 'stats':
        return await getCurationStats();
      case 'trending':
        return await getTrendingCandidates();
      default:
        return NextResponse.json({ error: 'Invalid type parameter' }, { status: 400 });
    }

  } catch (error) {
    console.error('Error fetching curation data:', error);
    return NextResponse.json(
      { error: 'Failed to fetch curation data' },
      { status: 500 }
    );
  }
}

async function getCurationQueue() {
  // Get articles that might need curation (high engagement, recent, not yet featured)
  const queue = await prisma.newsArticle.findMany({
    where: {
      status: 'PUBLISHED',
      isFeatured: false,
      publishedAt: {
        gte: new Date(Date.now() - 24 * 60 * 60 * 1000) // Last 24 hours
      },
      OR: [
        { viewCount: { gte: 100 } },
        { likeCount: { gte: 10 } },
        { shareCount: { gte: 5 } }
      ]
    },
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
    orderBy: [
      { viewCount: 'desc' },
      { likeCount: 'desc' },
      { publishedAt: 'desc' }
    ],
    take: 50
  });

  return NextResponse.json({ queue });
}

async function getCurationStats() {
  const [
    totalArticles,
    featuredArticles,
    trendingArticles,
    archivedArticles,
    recentArticles,
    topCategories,
    topSources
  ] = await Promise.all([
    prisma.newsArticle.count(),
    prisma.newsArticle.count({ where: { isFeatured: true } }),
    prisma.newsArticle.count({ where: { isTrending: true } }),
    prisma.newsArticle.count({ where: { status: 'ARCHIVED' } }),
    prisma.newsArticle.count({
      where: {
        publishedAt: {
          gte: new Date(Date.now() - 24 * 60 * 60 * 1000)
        }
      }
    }),
    prisma.newsArticle.groupBy({
      by: ['category'],
      _count: { category: true },
      orderBy: { _count: { category: 'desc' } },
      take: 10
    }),
    prisma.newsArticle.groupBy({
      by: ['sourceId'],
      _count: { sourceId: true },
      orderBy: { _count: { sourceId: 'desc' } },
      take: 10
    })
  ]);

  // Get source names for top sources
  const sourceIds = topSources.map(s => s.sourceId);
  const sources = await prisma.newsSource.findMany({
    where: { id: { in: sourceIds } },
    select: { id: true, name: true }
  });

  const topSourcesWithNames = topSources.map(source => ({
    ...source,
    sourceName: sources.find(s => s.id === source.sourceId)?.name || 'Unknown'
  }));

  return NextResponse.json({
    stats: {
      totalArticles,
      featuredArticles,
      trendingArticles,
      archivedArticles,
      recentArticles,
      topCategories,
      topSources: topSourcesWithNames
    }
  });
}

async function getTrendingCandidates() {
  // Get articles that are candidates for trending status
  const candidates = await prisma.newsArticle.findMany({
    where: {
      status: 'PUBLISHED',
      isTrending: false,
      publishedAt: {
        gte: new Date(Date.now() - 6 * 60 * 60 * 1000) // Last 6 hours
      },
      OR: [
        { viewCount: { gte: 500 } },
        { likeCount: { gte: 50 } },
        { shareCount: { gte: 25 } }
      ]
    },
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
    orderBy: [
      { viewCount: 'desc' },
      { likeCount: 'desc' },
      { shareCount: 'desc' }
    ],
    take: 20
  });

  return NextResponse.json({ candidates });
}
