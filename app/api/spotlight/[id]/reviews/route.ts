import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { z } from 'zod';

const createReviewSchema = z.object({
  rating: z.number().min(1).max(5),
  title: z.string().min(1).max(100),
  content: z.string().min(1).max(500),
});

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const profileId = params.id;
    const url = new URL(request.url);
    const page = parseInt(url.searchParams.get('page') || '1');
    const limit = parseInt(url.searchParams.get('limit') || '10');

    // Check if profile exists
    const profile = await prisma.spotlightProfile.findUnique({
      where: { id: profileId, isActive: true }
    });

    if (!profile) {
      return NextResponse.json({ error: 'Profile not found' }, { status: 404 });
    }

    const [reviews, total] = await Promise.all([
      prisma.spotlightReview.findMany({
        where: {
          spotlightId: profileId,
          isVerified: true
        },
        include: {
          reviewer: {
            select: {
              id: true,
              name: true,
              image: true
            }
          }
        },
        orderBy: { createdAt: 'desc' },
        skip: (page - 1) * limit,
        take: limit
      }),
      prisma.spotlightReview.count({
        where: {
          spotlightId: profileId,
          isVerified: true
        }
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
    console.error('Error fetching spotlight reviews:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const profileId = params.id;
    const body = await request.json();
    const validatedData = createReviewSchema.parse(body);

    // Check if profile exists
    const profile = await prisma.spotlightProfile.findUnique({
      where: { id: profileId, isActive: true }
    });

    if (!profile) {
      return NextResponse.json({ error: 'Profile not found' }, { status: 404 });
    }

    // Check if user is trying to review themselves
    if (profile.userId === session.user.id) {
      return NextResponse.json(
        { error: 'Cannot review your own profile' },
        { status: 400 }
      );
    }

    // Check if user already reviewed this profile
    const existingReview = await prisma.spotlightReview.findFirst({
      where: {
        spotlightId: profileId,
        reviewerId: session.user.id
      }
    });

    if (existingReview) {
      return NextResponse.json(
        { error: 'You have already reviewed this profile' },
        { status: 400 }
      );
    }

    // Create review
    const review = await prisma.spotlightReview.create({
      data: {
        spotlightId: profileId,
        reviewerId: session.user.id,
        ...validatedData
      },
      include: {
        reviewer: {
          select: {
            id: true,
            name: true,
            image: true
          }
        }
      }
    });

    // Update profile rating
    const allReviews = await prisma.spotlightReview.findMany({
      where: {
        spotlightId: profileId,
        isVerified: true
      },
      select: { rating: true }
    });

    const averageRating = allReviews.reduce((sum, r) => sum + r.rating, 0) / allReviews.length;

    await prisma.spotlightProfile.update({
      where: { id: profileId },
      data: {
        rating: averageRating,
        reviewCount: allReviews.length
      }
    });

    // Create notification for profile owner
    await prisma.notification.create({
      data: {
        userId: profile.userId,
        type: 'review',
        title: 'New Review Received!',
        message: `${session.user.name} left a ${validatedData.rating}-star review on your spotlight profile.`,
        data: { 
          reviewId: review.id, 
          reviewerId: session.user.id,
          rating: validatedData.rating 
        }
      }
    });

    return NextResponse.json(review, { status: 201 });

  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Validation error', details: error.errors },
        { status: 400 }
      );
    }

    console.error('Error creating spotlight review:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

