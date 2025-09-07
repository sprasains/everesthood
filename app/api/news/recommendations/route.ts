import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

// GET /api/news/recommendations - Get personalized news recommendations
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const limit = parseInt(searchParams.get('limit') || '10');
    const algorithm = searchParams.get('algorithm') || 'hybrid'; // 'preferences', 'trending', 'similar', 'hybrid'

    // Get user preferences
    const userPreferences = await prisma.userNewsPreference.findUnique({
      where: { userId: session.user.id }
    });

    // Get user's interaction history
    const userInteractions = await prisma.newsInteraction.findMany({
      where: { userId: session.user.id },
      include: {
        article: {
          include: {
            source: true
          }
        }
      },
      orderBy: { createdAt: 'desc' },
      take: 100
    });

    let recommendations: any[] = [];

    switch (algorithm) {
      case 'preferences':
        recommendations = await getPreferenceBasedRecommendations(userPreferences, limit);
        break;
      case 'trending':
        recommendations = await getTrendingRecommendations(limit);
        break;
      case 'similar':
        recommendations = await getSimilarContentRecommendations(userInteractions, limit);
        break;
      case 'hybrid':
      default:
        recommendations = await getHybridRecommendations(userPreferences, userInteractions, limit);
        break;
    }

    // Get user interactions for recommended articles
    const articleIds = recommendations.map(rec => rec.id);
    const userArticleInteractions = await prisma.newsInteraction.findMany({
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

    // Add user interaction data to recommendations
    const recommendationsWithInteractions = recommendations.map(article => {
      const interactions = userArticleInteractions.filter(i => i.articleId === article.id);
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
      recommendations: recommendationsWithInteractions,
      algorithm,
      total: recommendationsWithInteractions.length
    });

  } catch (error) {
    console.error('Error fetching news recommendations:', error);
    return NextResponse.json(
      { error: 'Failed to fetch recommendations' },
      { status: 500 }
    );
  }
}

// Preference-based recommendations
async function getPreferenceBasedRecommendations(userPreferences: any, limit: number) {
  if (!userPreferences || userPreferences.categories.length === 0) {
    return [];
  }

  return await prisma.newsArticle.findMany({
    where: {
      status: 'PUBLISHED',
      category: { in: userPreferences.categories },
      publishedAt: {
        gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) // Last 7 days
      }
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
      { isFeatured: 'desc' },
      { publishedAt: 'desc' }
    ],
    take: limit
  });
}

// Trending recommendations
async function getTrendingRecommendations(limit: number) {
  return await prisma.newsArticle.findMany({
    where: {
      status: 'PUBLISHED',
      isTrending: true,
      publishedAt: {
        gte: new Date(Date.now() - 24 * 60 * 60 * 1000) // Last 24 hours
      }
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
    take: limit
  });
}

// Similar content recommendations based on user interactions
async function getSimilarContentRecommendations(userInteractions: any[], limit: number) {
  if (userInteractions.length === 0) {
    return [];
  }

  // Get categories and sources from user's liked articles
  const likedCategories = new Set<string>();
  const likedSources = new Set<string>();
  const likedTags = new Set<string>();

  userInteractions.forEach(interaction => {
    if (interaction.type === 'like' && interaction.article) {
      likedCategories.add(interaction.article.category);
      likedSources.add(interaction.article.sourceId);
      interaction.article.tags.forEach((tag: string) => likedTags.add(tag));
    }
  });

  if (likedCategories.size === 0) {
    return [];
  }

  return await prisma.newsArticle.findMany({
    where: {
      status: 'PUBLISHED',
      OR: [
        { category: { in: Array.from(likedCategories) } },
        { sourceId: { in: Array.from(likedSources) } },
        { tags: { hasSome: Array.from(likedTags) } }
      ],
      publishedAt: {
        gte: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000) // Last 3 days
      }
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
      { isFeatured: 'desc' },
      { viewCount: 'desc' },
      { publishedAt: 'desc' }
    ],
    take: limit
  });
}

// Hybrid recommendations combining multiple algorithms
async function getHybridRecommendations(userPreferences: any, userInteractions: any[], limit: number) {
  const preferenceWeight = 0.4;
  const trendingWeight = 0.3;
  const similarWeight = 0.3;

  const [preferenceRecs, trendingRecs, similarRecs] = await Promise.all([
    getPreferenceBasedRecommendations(userPreferences, Math.ceil(limit * preferenceWeight)),
    getTrendingRecommendations(Math.ceil(limit * trendingWeight)),
    getSimilarContentRecommendations(userInteractions, Math.ceil(limit * similarWeight))
  ]);

  // Combine and deduplicate recommendations
  const allRecs = [...preferenceRecs, ...trendingRecs, ...similarRecs];
  const uniqueRecs = allRecs.filter((rec, index, self) => 
    index === self.findIndex(r => r.id === rec.id)
  );

  // Sort by relevance score (combination of factors)
  const scoredRecs = uniqueRecs.map(rec => {
    let score = 0;
    
    // Recency score (newer articles get higher scores)
    const hoursSincePublished = (Date.now() - new Date(rec.publishedAt).getTime()) / (1000 * 60 * 60);
    score += Math.max(0, 24 - hoursSincePublished) / 24 * 0.3;
    
    // Engagement score
    score += Math.log(rec.viewCount + 1) * 0.2;
    score += Math.log(rec.likeCount + 1) * 0.2;
    
    // Featured/trending bonus
    if (rec.isFeatured) score += 0.2;
    if (rec.isTrending) score += 0.1;
    
    return { ...rec, relevanceScore: score };
  });

  return scoredRecs
    .sort((a, b) => b.relevanceScore - a.relevanceScore)
    .slice(0, limit);
}
