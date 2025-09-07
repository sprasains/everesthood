import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

// GET /api/agents/[id]/reviews/[reviewId]/replies - Get replies for a review
export async function GET(
  req: NextRequest,
  { params }: { params: { id: string; reviewId: string } }
) {
  try {
    const { reviewId } = params;
    
    const replies = await prisma.agentReviewReply.findMany({
      where: { reviewId },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            image: true,
          }
        }
      },
      orderBy: { createdAt: 'asc' }
    });

    return NextResponse.json({ replies });
  } catch (error) {
    console.error('Error fetching replies:', error);
    return NextResponse.json(
      { error: 'Failed to fetch replies' },
      { status: 500 }
    );
  }
}

// POST /api/agents/[id]/reviews/[reviewId]/replies - Create a new reply
export async function POST(
  req: NextRequest,
  { params }: { params: { id: string; reviewId: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { reviewId } = params;
    const { content } = await req.json();

    if (!content || !content.trim()) {
      return NextResponse.json(
        { error: 'Content is required' },
        { status: 400 }
      );
    }

    // Verify the review exists
    const review = await prisma.agentReview.findUnique({
      where: { id: reviewId }
    });

    if (!review) {
      return NextResponse.json(
        { error: 'Review not found' },
        { status: 404 }
      );
    }

    const reply = await prisma.agentReviewReply.create({
      data: {
        reviewId,
        userId: session.user.id,
        content: content.trim()
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

    return NextResponse.json({ reply }, { status: 201 });
  } catch (error) {
    console.error('Error creating reply:', error);
    return NextResponse.json(
      { error: 'Failed to create reply' },
      { status: 500 }
    );
  }
}

// PUT /api/agents/[id]/reviews/[reviewId]/replies/[replyId] - Update a reply
export async function PUT(
  req: NextRequest,
  { params }: { params: { id: string; reviewId: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { reviewId } = params;
    const { searchParams } = new URL(req.url);
    const replyId = searchParams.get('replyId');
    const { content } = await req.json();

    if (!replyId) {
      return NextResponse.json(
        { error: 'Reply ID is required' },
        { status: 400 }
      );
    }

    if (!content || !content.trim()) {
      return NextResponse.json(
        { error: 'Content is required' },
        { status: 400 }
      );
    }

    // Verify the reply exists and belongs to the user
    const existingReply = await prisma.agentReviewReply.findFirst({
      where: {
        id: replyId,
        reviewId,
        userId: session.user.id
      }
    });

    if (!existingReply) {
      return NextResponse.json(
        { error: 'Reply not found or unauthorized' },
        { status: 404 }
      );
    }

    // Update the reply
    const updatedReply = await prisma.agentReviewReply.update({
      where: { id: replyId },
      data: {
        content: content.trim()
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

    return NextResponse.json({ reply: updatedReply });
  } catch (error) {
    console.error('Error updating reply:', error);
    return NextResponse.json(
      { error: 'Failed to update reply' },
      { status: 500 }
    );
  }
}

// DELETE /api/agents/[id]/reviews/[reviewId]/replies/[replyId] - Delete a reply
export async function DELETE(
  req: NextRequest,
  { params }: { params: { id: string; reviewId: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { reviewId } = params;
    const { searchParams } = new URL(req.url);
    const replyId = searchParams.get('replyId');

    if (!replyId) {
      return NextResponse.json(
        { error: 'Reply ID is required' },
        { status: 400 }
      );
    }

    // Verify the reply exists and belongs to the user
    const reply = await prisma.agentReviewReply.findFirst({
      where: {
        id: replyId,
        reviewId,
        userId: session.user.id
      }
    });

    if (!reply) {
      return NextResponse.json(
        { error: 'Reply not found or unauthorized' },
        { status: 404 }
      );
    }

    // Delete the reply
    await prisma.agentReviewReply.delete({
      where: { id: replyId }
    });

    return NextResponse.json({ message: 'Reply deleted successfully' });
  } catch (error) {
    console.error('Error deleting reply:', error);
    return NextResponse.json(
      { error: 'Failed to delete reply' },
      { status: 500 }
    );
  }
}
