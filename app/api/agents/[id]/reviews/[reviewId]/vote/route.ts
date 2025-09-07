import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

// POST /api/agents/[id]/reviews/[reviewId]/vote - Vote on a review
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
    const { isHelpful } = await req.json();

    if (typeof isHelpful !== 'boolean') {
      return NextResponse.json(
        { error: 'isHelpful must be a boolean' },
        { status: 400 }
      );
    }

    // Check if user already voted on this review
    const existingVote = await prisma.reviewVote.findFirst({
      where: {
        reviewId,
        userId: session.user.id
      }
    });

    if (existingVote) {
      // Update existing vote
      await prisma.reviewVote.update({
        where: { id: existingVote.id },
        data: { isHelpful }
      });
    } else {
      // Create new vote
      await prisma.reviewVote.create({
        data: {
          reviewId,
          userId: session.user.id,
          isHelpful
        }
      });
    }

    // Update review vote counts
    const helpfulCount = await prisma.reviewVote.count({
      where: { reviewId, isHelpful: true }
    });

    const notHelpfulCount = await prisma.reviewVote.count({
      where: { reviewId, isHelpful: false }
    });

    await prisma.agentReview.update({
      where: { id: reviewId },
      data: {
        helpful: helpfulCount,
        notHelpful: notHelpfulCount
      }
    });

    return NextResponse.json({ 
      helpful: helpfulCount,
      notHelpful: notHelpfulCount
    });
  } catch (error) {
    console.error('Error voting on review:', error);
    return NextResponse.json(
      { error: 'Failed to vote on review' },
      { status: 500 }
    );
  }
}

