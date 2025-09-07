import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { z } from 'zod';

const createReviewSchema = z.object({
  rating: z.number().min(1).max(5),
  title: z.string().min(1).max(100).optional(),
  content: z.string().min(1).max(1000).optional(),
});

// GET /api/guides/[id]/reviews - Get guide reviews
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    const skip = (page - 1) * limit;

    const [reviews, total] = await Promise.all([
      prisma.guideReview.findMany({
        where: { guideId: params.id },
        include: {
          user: {
            select: {
              id: true,
              name: true,
              image: true
            }
          }
        },
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit
      }),
      prisma.guideReview.count({
        where: { guideId: params.id }
      })
    ]);

    return NextResponse.json({
      reviews,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    });

  } catch (error) {
    console.error('Error fetching guide reviews:', error);
    return NextResponse.json(
      { error: 'Failed to fetch guide reviews' },
      { status: 500 }
    );
  }
}

// POST /api/guides/[id]/reviews - Create guide review
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
    const validatedData = createReviewSchema.parse(body);

    // Check if guide exists
    const guide = await prisma.guide.findUnique({
      where: { id: params.id }
    });

    if (!guide) {
      return NextResponse.json({ error: 'Guide not found' }, { status: 404 });
    }

    // Check if user already reviewed this guide
    const existingReview = await prisma.guideReview.findFirst({
      where: {
        guideId: params.id,
        userId: session.user.id
      }
    });

    if (existingReview) {
      return NextResponse.json(
        { error: 'You have already reviewed this guide' },
        { status: 400 }
      );
    }

    const review = await prisma.guideReview.create({
      data: {
        guideId: params.id,
        userId: session.user.id,
        rating: validatedData.rating,
        title: validatedData.title,
        content: validatedData.content
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

    // Update guide rating
    await updateGuideRating(params.id);

    return NextResponse.json(review, { status: 201 });

  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid input', details: error.errors },
        { status: 400 }
      );
    }

    console.error('Error creating guide review:', error);
    return NextResponse.json(
      { error: 'Failed to create guide review' },
      { status: 500 }
    );
  }
}

// Helper function to update guide rating
async function updateGuideRating(guideId: string) {
  const reviews = await prisma.guideReview.findMany({
    where: { guideId },
    select: { rating: true }
  });

  const averageRating = reviews.length > 0 
    ? reviews.reduce((sum, review) => sum + review.rating, 0) / reviews.length 
    : 0;

  await prisma.guide.update({
    where: { id: guideId },
    data: {
      rating: Math.round(averageRating * 10) / 10,
      reviewCount: reviews.length
    }
  });
}
