import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

// GET /api/agents/[id]/reviews - Get reviews for an agent
export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;
    
    const reviews = await prisma.agentReview.findMany({
      where: { agentId: id },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            image: true,
          }
        },
        replies: {
          include: {
            user: {
              select: {
                id: true,
                name: true,
                image: true,
              }
            }
          }
        }
      },
      orderBy: { createdAt: 'desc' }
    });

    return NextResponse.json({ reviews });
  } catch (error) {
    console.error('Error fetching reviews:', error);
    return NextResponse.json(
      { error: 'Failed to fetch reviews' },
      { status: 500 }
    );
  }
}

// POST /api/agents/[id]/reviews - Create a new review
export async function POST(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = params;
    const { rating, title, content } = await req.json();

    if (!rating || !title || !content) {
      return NextResponse.json(
        { error: 'Rating, title, and content are required' },
        { status: 400 }
      );
    }

    // Check if user already reviewed this agent
    const existingReview = await prisma.agentReview.findFirst({
      where: {
        agentId: id,
        userId: session.user.id
      }
    });

    if (existingReview) {
      return NextResponse.json(
        { error: 'You have already reviewed this agent' },
        { status: 400 }
      );
    }

    const review = await prisma.agentReview.create({
      data: {
        agentId: id,
        userId: session.user.id,
        rating,
        title,
        content,
        helpful: 0,
        notHelpful: 0,
        isVerified: true // You can implement verification logic here
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            image: true,
          }
        }
      }
    });

    // Update agent's average rating
    await updateAgentRating(id);

    return NextResponse.json({ review }, { status: 201 });
  } catch (error) {
    console.error('Error creating review:', error);
    return NextResponse.json(
      { error: 'Failed to create review' },
      { status: 500 }
    );
  }
}

// PUT /api/agents/[id]/reviews/[reviewId] - Update a review
export async function PUT(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = params;
    const { searchParams } = new URL(req.url);
    const reviewId = searchParams.get('reviewId');
    const { rating, title, content } = await req.json();

    if (!reviewId) {
      return NextResponse.json(
        { error: 'Review ID is required' },
        { status: 400 }
      );
    }

    if (!rating || !title || !content) {
      return NextResponse.json(
        { error: 'Rating, title, and content are required' },
        { status: 400 }
      );
    }

    // Verify the review exists and belongs to the user
    const existingReview = await prisma.agentReview.findFirst({
      where: {
        id: reviewId,
        agentId: id,
        userId: session.user.id
      }
    });

    if (!existingReview) {
      return NextResponse.json(
        { error: 'Review not found or unauthorized' },
        { status: 404 }
      );
    }

    // Update the review
    const updatedReview = await prisma.agentReview.update({
      where: { id: reviewId },
      data: {
        rating,
        title,
        content
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            image: true,
          }
        }
      }
    });

    // Update agent's average rating
    await updateAgentRating(id);

    return NextResponse.json({ review: updatedReview });
  } catch (error) {
    console.error('Error updating review:', error);
    return NextResponse.json(
      { error: 'Failed to update review' },
      { status: 500 }
    );
  }
}

// DELETE /api/agents/[id]/reviews/[reviewId] - Delete a review
export async function DELETE(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = params;
    const { searchParams } = new URL(req.url);
    const reviewId = searchParams.get('reviewId');

    if (!reviewId) {
      return NextResponse.json(
        { error: 'Review ID is required' },
        { status: 400 }
      );
    }

    // Verify the review exists and belongs to the user
    const review = await prisma.agentReview.findFirst({
      where: {
        id: reviewId,
        agentId: id,
        userId: session.user.id
      }
    });

    if (!review) {
      return NextResponse.json(
        { error: 'Review not found or unauthorized' },
        { status: 404 }
      );
    }

    // Delete the review
    await prisma.agentReview.delete({
      where: { id: reviewId }
    });

    // Update agent's average rating
    await updateAgentRating(id);

    return NextResponse.json({ message: 'Review deleted successfully' });
  } catch (error) {
    console.error('Error deleting review:', error);
    return NextResponse.json(
      { error: 'Failed to delete review' },
      { status: 500 }
    );
  }
}

async function updateAgentRating(agentId: string) {
  const reviews = await prisma.agentReview.findMany({
    where: { agentId },
    select: { rating: true }
  });

  if (reviews.length > 0) {
    const averageRating = reviews.reduce((sum, review) => sum + review.rating, 0) / reviews.length;
    
    await prisma.agentTemplate.update({
      where: { id: agentId },
      data: { averageRating }
    });
  }
}
