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

// GET /api/personas/[id]/reviews - Get persona reviews
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
      prisma.personaReview.findMany({
        where: { personaId: params.id },
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
      prisma.personaReview.count({
        where: { personaId: params.id }
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
    console.error('Error fetching persona reviews:', error);
    return NextResponse.json(
      { error: 'Failed to fetch persona reviews' },
      { status: 500 }
    );
  }
}

// POST /api/personas/[id]/reviews - Create persona review
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

    // Check if persona exists and is accessible
    const persona = await prisma.persona.findUnique({
      where: { id: params.id }
    });

    if (!persona) {
      return NextResponse.json({ error: 'Persona not found' }, { status: 404 });
    }

    if (persona.visibility === 'PRIVATE' && persona.userId !== session.user.id) {
      return NextResponse.json({ error: 'Access denied' }, { status: 403 });
    }

    // Check if user already reviewed this persona
    const existingReview = await prisma.personaReview.findFirst({
      where: {
        personaId: params.id,
        userId: session.user.id
      }
    });

    if (existingReview) {
      return NextResponse.json(
        { error: 'You have already reviewed this persona' },
        { status: 400 }
      );
    }

    const review = await prisma.personaReview.create({
      data: {
        personaId: params.id,
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

    // Update persona rating
    await updatePersonaRating(params.id);

    return NextResponse.json(review, { status: 201 });

  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid input', details: error.errors },
        { status: 400 }
      );
    }

    console.error('Error creating persona review:', error);
    return NextResponse.json(
      { error: 'Failed to create persona review' },
      { status: 500 }
    );
  }
}

// Helper function to update persona rating
async function updatePersonaRating(personaId: string) {
  const reviews = await prisma.personaReview.findMany({
    where: { personaId },
    select: { rating: true }
  });

  const averageRating = reviews.length > 0 
    ? reviews.reduce((sum, review) => sum + review.rating, 0) / reviews.length 
    : 0;

  await prisma.persona.update({
    where: { id: personaId },
    data: {
      rating: Math.round(averageRating * 10) / 10,
      reviewCount: reviews.length
    }
  });
}
