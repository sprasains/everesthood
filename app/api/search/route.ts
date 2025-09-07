import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const url = new URL(request.url);
    const query = url.searchParams.get('q');
    const type = url.searchParams.get('type') || 'all';
    const limit = parseInt(url.searchParams.get('limit') || '10');

    if (!query || query.trim().length < 2) {
      return NextResponse.json({ error: 'Query must be at least 2 characters' }, { status: 400 });
    }

    const searchQuery = query.trim();
    const results: any = {};

    // Search across different modules based on type
    if (type === 'all' || type === 'agents') {
      const agents = await prisma.agentInstance.findMany({
        where: {
          userId: session.user.id,
          OR: [
            { name: { contains: searchQuery, mode: 'insensitive' } },
            { description: { contains: searchQuery, mode: 'insensitive' } }
          ]
        },
        include: {
          template: {
            select: {
              name: true,
              category: true
            }
          }
        },
        take: limit
      });
      results.agents = agents;
    }

    if (type === 'all' || type === 'posts') {
      const posts = await prisma.post.findMany({
        where: {
          OR: [
            { title: { contains: searchQuery, mode: 'insensitive' } },
            { content: { contains: searchQuery, mode: 'insensitive' } },
            { tags: { hasSome: [searchQuery] } }
          ]
        },
        include: {
          user: {
            select: {
              id: true,
              name: true,
              image: true
            }
          },
          _count: {
            select: {
              comments: true,
              likes: true
            }
          }
        },
        orderBy: { createdAt: 'desc' },
        take: limit
      });
      results.posts = posts;
    }

    if (type === 'all' || type === 'health') {
      const healthMetrics = await prisma.healthMetric.findMany({
        where: {
          userId: session.user.id,
          OR: [
            { metric: { contains: searchQuery, mode: 'insensitive' } },
            { notes: { contains: searchQuery, mode: 'insensitive' } },
            { category: { contains: searchQuery, mode: 'insensitive' } }
          ]
        },
        orderBy: { date: 'desc' },
        take: limit
      });

      const healthGoals = await prisma.healthGoal.findMany({
        where: {
          userId: session.user.id,
          OR: [
            { title: { contains: searchQuery, mode: 'insensitive' } },
            { description: { contains: searchQuery, mode: 'insensitive' } },
            { category: { contains: searchQuery, mode: 'insensitive' } }
          ]
        },
        orderBy: { deadline: 'asc' },
        take: limit
      });

      results.health = {
        metrics: healthMetrics,
        goals: healthGoals
      };
    }

    if (type === 'all' || type === 'financial') {
      const transactions = await prisma.transaction.findMany({
        where: {
          userId: session.user.id,
          OR: [
            { description: { contains: searchQuery, mode: 'insensitive' } },
            { category: { contains: searchQuery, mode: 'insensitive' } },
            { notes: { contains: searchQuery, mode: 'insensitive' } },
            { tags: { hasSome: [searchQuery] } }
          ]
        },
        orderBy: { date: 'desc' },
        take: limit
      });

      const budgets = await prisma.budget.findMany({
        where: {
          userId: session.user.id,
          OR: [
            { name: { contains: searchQuery, mode: 'insensitive' } },
            { category: { contains: searchQuery, mode: 'insensitive' } }
          ]
        },
        orderBy: { startDate: 'desc' },
        take: limit
      });

      const bills = await prisma.bill.findMany({
        where: {
          userId: session.user.id,
          OR: [
            { name: { contains: searchQuery, mode: 'insensitive' } },
            { category: { contains: searchQuery, mode: 'insensitive' } },
            { notes: { contains: searchQuery, mode: 'insensitive' } }
          ]
        },
        orderBy: { dueDate: 'asc' },
        take: limit
      });

      results.financial = {
        transactions,
        budgets,
        bills
      };
    }

    if (type === 'all' || type === 'shopping') {
      const products = await prisma.product.findMany({
        where: {
          isActive: true,
          OR: [
            { name: { contains: searchQuery, mode: 'insensitive' } },
            { description: { contains: searchQuery, mode: 'insensitive' } },
            { brand: { contains: searchQuery, mode: 'insensitive' } },
            { category: { contains: searchQuery, mode: 'insensitive' } },
            { tags: { hasSome: [searchQuery] } }
          ]
        },
        include: {
          seller: {
            select: {
              id: true,
              name: true,
              rating: true,
              verified: true
            }
          },
          _count: {
            select: {
              reviews: true
            }
          }
        },
        orderBy: { rating: 'desc' },
        take: limit
      });

      const cartItems = await prisma.cartItem.findMany({
        where: {
          userId: session.user.id,
          product: {
            OR: [
              { name: { contains: searchQuery, mode: 'insensitive' } },
              { description: { contains: searchQuery, mode: 'insensitive' } },
              { brand: { contains: searchQuery, mode: 'insensitive' } }
            ]
          }
        },
        include: {
          product: {
            include: {
              seller: {
                select: {
                  id: true,
                  name: true,
                  rating: true,
                  verified: true
                }
              }
            }
          }
        },
        take: limit
      });

      const wishlistItems = await prisma.wishlistItem.findMany({
        where: {
          userId: session.user.id,
          product: {
            OR: [
              { name: { contains: searchQuery, mode: 'insensitive' } },
              { description: { contains: searchQuery, mode: 'insensitive' } },
              { brand: { contains: searchQuery, mode: 'insensitive' } }
            ]
          }
        },
        include: {
          product: {
            include: {
              seller: {
                select: {
                  id: true,
                  name: true,
                  rating: true,
                  verified: true
                }
              }
            }
          }
        },
        take: limit
      });

      results.shopping = {
        products,
        cartItems,
        wishlistItems
      };
    }

    if (type === 'all' || type === 'tasks') {
      const tasks = await prisma.task.findMany({
        where: {
          userId: session.user.id,
          content: { contains: searchQuery, mode: 'insensitive' }
        },
        orderBy: { createdAt: 'desc' },
        take: limit
      });
      results.tasks = tasks;
    }

    if (type === 'all' || type === 'summaries') {
      const summaries = await prisma.aISummary.findMany({
        where: {
          userId: session.user.id,
          OR: [
            { title: { contains: searchQuery, mode: 'insensitive' } },
            { content: { contains: searchQuery, mode: 'insensitive' } },
            { summary: { contains: searchQuery, mode: 'insensitive' } },
            { tags: { hasSome: [searchQuery] } }
          ]
        },
        orderBy: { createdAt: 'desc' },
        take: limit
      });
      results.summaries = summaries;
    }

    if (type === 'all' || type === 'wellness') {
      const wellnessSessions = await prisma.wellnessSession.findMany({
        where: {
          userId: session.user.id,
          OR: [
            { type: { contains: searchQuery, mode: 'insensitive' } },
            { notes: { contains: searchQuery, mode: 'insensitive' } }
          ]
        },
        orderBy: { createdAt: 'desc' },
        take: limit
      });
      results.wellness = wellnessSessions;
    }

    // Calculate total results count
    const totalResults = Object.values(results).reduce((total, section) => {
      if (Array.isArray(section)) {
        return total + section.length;
      } else if (typeof section === 'object' && section !== null) {
        return total + Object.values(section).reduce((subTotal, items) => {
          return subTotal + (Array.isArray(items) ? items.length : 0);
        }, 0);
      }
      return total;
    }, 0);

    return NextResponse.json({
      query: searchQuery,
      type,
      totalResults,
      results
    });

  } catch (error) {
    console.error('Error performing search:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
