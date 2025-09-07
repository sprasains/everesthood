import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { z } from 'zod';

const updateGuideSchema = z.object({
  title: z.string().min(1).max(200).optional(),
  description: z.string().min(1).max(1000).optional(),
  content: z.string().min(1).optional(),
  category: z.string().min(1).optional(),
  tags: z.array(z.string()).optional(),
  difficulty: z.enum(['BEGINNER', 'INTERMEDIATE', 'ADVANCED', 'EXPERT']).optional(),
  status: z.enum(['DRAFT', 'PUBLISHED', 'ARCHIVED', 'UNDER_REVIEW']).optional(),
  isPublic: z.boolean().optional(),
  isFeatured: z.boolean().optional(),
  thumbnail: z.string().url().optional(),
  estimatedTime: z.number().min(1).optional(),
  prerequisites: z.array(z.string()).optional(),
  learningOutcomes: z.array(z.string()).optional(),
});

// GET /api/guides/[id] - Get specific guide
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const guide = await prisma.guide.findUnique({
      where: { id: params.id },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            image: true
          }
        },
        steps: {
          orderBy: { order: 'asc' }
        },
        reviews: {
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
          take: 10
        },
        _count: {
          select: {
            steps: true,
            reviews: true,
            progress: true,
            bookmarks: true
          }
        }
      }
    });

    if (!guide) {
      return NextResponse.json({ error: 'Guide not found' }, { status: 404 });
    }

    // Check if user can access this guide
    if (!guide.isPublic && guide.userId !== session.user.id) {
      return NextResponse.json({ error: 'Access denied' }, { status: 403 });
    }

    // Calculate average rating
    const reviews = await prisma.guideReview.findMany({
      where: { guideId: guide.id },
      select: { rating: true }
    });

    const averageRating = reviews.length > 0 
      ? reviews.reduce((sum, review) => sum + review.rating, 0) / reviews.length 
      : 0;

    // Get user's progress
    const userProgress = await prisma.guideProgress.findUnique({
      where: {
        guideId_userId: {
          guideId: guide.id,
          userId: session.user.id
        }
      }
    });

    // Check if user has bookmarked this guide
    const userBookmark = await prisma.guideBookmark.findUnique({
      where: {
        guideId_userId: {
          guideId: guide.id,
          userId: session.user.id
        }
      }
    });

    // Increment view count if user is not the author
    if (guide.userId !== session.user.id) {
      await prisma.guide.update({
        where: { id: params.id },
        data: { viewCount: { increment: 1 } }
      });
    }

    return NextResponse.json({
      ...guide,
      averageRating: Math.round(averageRating * 10) / 10,
      reviewCount: reviews.length,
      userProgress: userProgress ? {
        progress: userProgress.progress,
        isCompleted: userProgress.isCompleted,
        currentStep: userProgress.currentStep,
        timeSpent: userProgress.timeSpent
      } : null,
      isBookmarked: !!userBookmark
    });

  } catch (error) {
    console.error('Error fetching guide:', error);
    return NextResponse.json(
      { error: 'Failed to fetch guide' },
      { status: 500 }
    );
  }
}

// PUT /api/guides/[id] - Update guide
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const validatedData = updateGuideSchema.parse(body);

    // Check if guide exists and user owns it
    const existingGuide = await prisma.guide.findUnique({
      where: { id: params.id }
    });

    if (!existingGuide) {
      return NextResponse.json({ error: 'Guide not found' }, { status: 404 });
    }

    if (existingGuide.userId !== session.user.id) {
      return NextResponse.json({ error: 'Access denied' }, { status: 403 });
    }

    // Check if title is being changed and if it conflicts
    if (validatedData.title && validatedData.title !== existingGuide.title) {
      const titleConflict = await prisma.guide.findFirst({
        where: {
          userId: session.user.id,
          title: validatedData.title,
          id: { not: params.id }
        }
      });

      if (titleConflict) {
        return NextResponse.json(
          { error: 'A guide with this title already exists' },
          { status: 400 }
        );
      }
    }

    // Set publishedAt if status is being changed to PUBLISHED
    const updateData: any = { ...validatedData };
    if (validatedData.status === 'PUBLISHED' && existingGuide.status !== 'PUBLISHED') {
      updateData.publishedAt = new Date();
    }

    const guide = await prisma.guide.update({
      where: { id: params.id },
      data: updateData,
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

    return NextResponse.json(guide);

  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid input', details: error.errors },
        { status: 400 }
      );
    }

    console.error('Error updating guide:', error);
    return NextResponse.json(
      { error: 'Failed to update guide' },
      { status: 500 }
    );
  }
}

// DELETE /api/guides/[id] - Delete guide
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Check if guide exists and user owns it
    const existingGuide = await prisma.guide.findUnique({
      where: { id: params.id }
    });

    if (!existingGuide) {
      return NextResponse.json({ error: 'Guide not found' }, { status: 404 });
    }

    if (existingGuide.userId !== session.user.id) {
      return NextResponse.json({ error: 'Access denied' }, { status: 403 });
    }

    // Delete guide and all related data (cascade)
    await prisma.guide.delete({
      where: { id: params.id }
    });

    return NextResponse.json({ message: 'Guide deleted successfully' });

  } catch (error) {
    console.error('Error deleting guide:', error);
    return NextResponse.json(
      { error: 'Failed to delete guide' },
      { status: 500 }
    );
  }
}
