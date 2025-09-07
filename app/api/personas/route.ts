import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { z } from 'zod';

const createPersonaSchema = z.object({
  name: z.string().min(1).max(100),
  description: z.string().min(1).max(500),
  personality: z.string().min(1),
  systemPrompt: z.string().min(1).max(2000),
  avatar: z.string().url().optional(),
  visibility: z.enum(['PRIVATE', 'PUBLIC', 'SHARED']).default('PRIVATE'),
  tags: z.array(z.string()).default([]),
});

const updatePersonaSchema = createPersonaSchema.partial();

// GET /api/personas - List personas with filtering and pagination
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    const search = searchParams.get('search') || '';
    const visibility = searchParams.get('visibility') || '';
    const tags = searchParams.get('tags')?.split(',') || [];
    const sortBy = searchParams.get('sortBy') || 'createdAt';
    const sortOrder = searchParams.get('sortOrder') || 'desc';

    const skip = (page - 1) * limit;

    // Build where clause
    const where: any = {
      OR: [
        { visibility: 'PUBLIC' },
        { visibility: 'SHARED' },
        { userId: session.user.id }
      ]
    };

    if (search) {
      where.AND = [
        {
          OR: [
            { name: { contains: search, mode: 'insensitive' } },
            { description: { contains: search, mode: 'insensitive' } },
            { tags: { hasSome: [search] } }
          ]
        }
      ];
    }

    if (visibility) {
      where.visibility = visibility;
    }

    if (tags.length > 0) {
      where.tags = { hasSome: tags };
    }

    // Build orderBy clause
    const orderBy: any = {};
    orderBy[sortBy] = sortOrder;

    const [personas, total] = await Promise.all([
      prisma.persona.findMany({
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
              instances: true,
              reviews: true
            }
          }
        },
        orderBy,
        skip,
        take: limit
      }),
      prisma.persona.count({ where })
    ]);

    // Calculate average ratings
    const personasWithRatings = await Promise.all(
      personas.map(async (persona) => {
        const reviews = await prisma.personaReview.findMany({
          where: { personaId: persona.id },
          select: { rating: true }
        });

        const averageRating = reviews.length > 0 
          ? reviews.reduce((sum, review) => sum + review.rating, 0) / reviews.length 
          : 0;

        return {
          ...persona,
          averageRating: Math.round(averageRating * 10) / 10,
          reviewCount: reviews.length
        };
      })
    );

    return NextResponse.json({
      personas: personasWithRatings,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    });

  } catch (error) {
    console.error('Error fetching personas:', error);
    return NextResponse.json(
      { error: 'Failed to fetch personas' },
      { status: 500 }
    );
  }
}

// POST /api/personas - Create new persona
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const validatedData = createPersonaSchema.parse(body);

    // Check if user already has a persona with this name
    const existingPersona = await prisma.persona.findFirst({
      where: {
        userId: session.user.id,
        name: validatedData.name
      }
    });

    if (existingPersona) {
      return NextResponse.json(
        { error: 'A persona with this name already exists' },
        { status: 400 }
      );
    }

    const persona = await prisma.persona.create({
      data: {
        ...validatedData,
        userId: session.user.id,
        personality: JSON.stringify(validatedData.personality)
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

    return NextResponse.json(persona, { status: 201 });

  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid input', details: error.errors },
        { status: 400 }
      );
    }

    console.error('Error creating persona:', error);
    return NextResponse.json(
      { error: 'Failed to create persona' },
      { status: 500 }
    );
  }
}
