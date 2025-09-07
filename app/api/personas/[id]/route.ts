import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { z } from 'zod';

const updatePersonaSchema = z.object({
  name: z.string().min(1).max(100).optional(),
  description: z.string().min(1).max(500).optional(),
  personality: z.string().min(1).optional(),
  systemPrompt: z.string().min(1).max(2000).optional(),
  avatar: z.string().url().optional(),
  visibility: z.enum(['PRIVATE', 'PUBLIC', 'SHARED']).optional(),
  tags: z.array(z.string()).optional(),
  status: z.enum(['DRAFT', 'ACTIVE', 'INACTIVE', 'ARCHIVED']).optional(),
});

// GET /api/personas/[id] - Get specific persona
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const persona = await prisma.persona.findUnique({
      where: { id: params.id },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            image: true
          }
        },
        instances: {
          where: { userId: session.user.id },
          select: {
            id: true,
            name: true,
            isActive: true,
            createdAt: true
          }
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
            instances: true,
            reviews: true,
            shares: true
          }
        }
      }
    });

    if (!persona) {
      return NextResponse.json({ error: 'Persona not found' }, { status: 404 });
    }

    // Check if user can access this persona
    if (persona.visibility === 'PRIVATE' && persona.userId !== session.user.id) {
      return NextResponse.json({ error: 'Access denied' }, { status: 403 });
    }

    // Calculate average rating
    const reviews = await prisma.personaReview.findMany({
      where: { personaId: persona.id },
      select: { rating: true }
    });

    const averageRating = reviews.length > 0 
      ? reviews.reduce((sum, review) => sum + review.rating, 0) / reviews.length 
      : 0;

    return NextResponse.json({
      ...persona,
      averageRating: Math.round(averageRating * 10) / 10,
      reviewCount: reviews.length
    });

  } catch (error) {
    console.error('Error fetching persona:', error);
    return NextResponse.json(
      { error: 'Failed to fetch persona' },
      { status: 500 }
    );
  }
}

// PUT /api/personas/[id] - Update persona
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
    const validatedData = updatePersonaSchema.parse(body);

    // Check if persona exists and user owns it
    const existingPersona = await prisma.persona.findUnique({
      where: { id: params.id }
    });

    if (!existingPersona) {
      return NextResponse.json({ error: 'Persona not found' }, { status: 404 });
    }

    if (existingPersona.userId !== session.user.id) {
      return NextResponse.json({ error: 'Access denied' }, { status: 403 });
    }

    // Check if name is being changed and if it conflicts
    if (validatedData.name && validatedData.name !== existingPersona.name) {
      const nameConflict = await prisma.persona.findFirst({
        where: {
          userId: session.user.id,
          name: validatedData.name,
          id: { not: params.id }
        }
      });

      if (nameConflict) {
        return NextResponse.json(
          { error: 'A persona with this name already exists' },
          { status: 400 }
        );
      }
    }

    const updateData: any = { ...validatedData };
    if (validatedData.personality) {
      updateData.personality = JSON.stringify(validatedData.personality);
    }

    const persona = await prisma.persona.update({
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

    return NextResponse.json(persona);

  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid input', details: error.errors },
        { status: 400 }
      );
    }

    console.error('Error updating persona:', error);
    return NextResponse.json(
      { error: 'Failed to update persona' },
      { status: 500 }
    );
  }
}

// DELETE /api/personas/[id] - Delete persona
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Check if persona exists and user owns it
    const existingPersona = await prisma.persona.findUnique({
      where: { id: params.id }
    });

    if (!existingPersona) {
      return NextResponse.json({ error: 'Persona not found' }, { status: 404 });
    }

    if (existingPersona.userId !== session.user.id) {
      return NextResponse.json({ error: 'Access denied' }, { status: 403 });
    }

    // Delete persona and all related data
    await prisma.persona.delete({
      where: { id: params.id }
    });

    return NextResponse.json({ message: 'Persona deleted successfully' });

  } catch (error) {
    console.error('Error deleting persona:', error);
    return NextResponse.json(
      { error: 'Failed to delete persona' },
      { status: 500 }
    );
  }
}
