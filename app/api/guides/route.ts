import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { z } from 'zod';

const createGuideSchema = z.object({
  title: z.string().min(1).max(200),
  description: z.string().min(1).max(1000),
  content: z.string().min(1),
  category: z.string().min(1),
  tags: z.array(z.string()).default([]),
  difficulty: z.enum(['BEGINNER', 'INTERMEDIATE', 'ADVANCED', 'EXPERT']).default('BEGINNER'),
  isPublic: z.boolean().default(false),
  thumbnail: z.string().url().optional(),
  estimatedTime: z.number().min(1).optional(),
  prerequisites: z.array(z.string()).default([]),
  learningOutcomes: z.array(z.string()).default([]),
});

// GET /api/guides - List guides with filtering and pagination
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '12');
    const search = searchParams.get('search') || '';
    const category = searchParams.get('category') || '';
    const difficulty = searchParams.get('difficulty') || '';
    const tags = searchParams.get('tags')?.split(',') || [];
    const sortBy = searchParams.get('sortBy') || 'createdAt';
    const sortOrder = searchParams.get('sortOrder') || 'desc';
    const featured = searchParams.get('featured') === 'true';

    const skip = (page - 1) * limit;

    // Build where clause
    const where: any = {
      OR: [
        { isPublic: true },
        { userId: session.user.id }
      ]
    };

    if (featured) {
      where.isFeatured = true;
    }

    if (search) {
      where.AND = [
        {
          OR: [
            { title: { contains: search, mode: 'insensitive' } },
            { description: { contains: search, mode: 'insensitive' } },
            { tags: { hasSome: [search] } }
          ]
        }
      ];
    }

    if (category) {
      where.category = category;
    }

    if (difficulty) {
      where.difficulty = difficulty;
    }

    if (tags.length > 0) {
      where.tags = { hasSome: tags };
    }

    // Build orderBy clause
    const orderBy: any = {};
    orderBy[sortBy] = sortOrder;

    const [guides, total] = await Promise.all([
      prisma.guide.findMany({
        where,
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
              steps: true,
              reviews: true,
              progress: true
            }
          }
        },
        orderBy,
        skip,
        take: limit
      }),
      prisma.guide.count({ where })
    ]);

    // Calculate average ratings and check user progress
    const guidesWithRatings = await Promise.all(
      guides.map(async (guide) => {
        const reviews = await prisma.guideReview.findMany({
          where: { guideId: guide.id },
          select: { rating: true }
        });

        const averageRating = reviews.length > 0 
          ? reviews.reduce((sum, review) => sum + review.rating, 0) / reviews.length 
          : 0;

        // Check if user has progress on this guide
        const userProgress = await prisma.guideProgress.findUnique({
          where: {
            guideId_userId: {
              guideId: guide.id,
              userId: session.user.id
            }
          }
        });

        return {
          ...guide,
          averageRating: Math.round(averageRating * 10) / 10,
          reviewCount: reviews.length,
          userProgress: userProgress ? {
            progress: userProgress.progress,
            isCompleted: userProgress.isCompleted,
            currentStep: userProgress.currentStep
          } : null
        };
      })
    );

    return NextResponse.json({
      guides: guidesWithRatings,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    });

  } catch (error) {
    console.error('Error fetching guides:', error);
    return NextResponse.json(
      { error: 'Failed to fetch guides' },
      { status: 500 }
    );
  }
}

// POST /api/guides - Create new guide
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const validatedData = createGuideSchema.parse(body);

    // Check if user already has a guide with this title
    const existingGuide = await prisma.guide.findFirst({
      where: {
        userId: session.user.id,
        title: validatedData.title
      }
    });

    if (existingGuide) {
      return NextResponse.json(
        { error: 'A guide with this title already exists' },
        { status: 400 }
      );
    }

    const guide = await prisma.guide.create({
      data: {
        ...validatedData,
        userId: session.user.id
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            image: true
          }
        }
      }
    });

    return NextResponse.json(guide, { status: 201 });

  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid input', details: error.errors },
        { status: 400 }
      );
    }

    console.error('Error creating guide:', error);
    return NextResponse.json(
      { error: 'Failed to create guide' },
      { status: 500 }
    );
  }
}
