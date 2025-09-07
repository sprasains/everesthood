import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { z } from 'zod';

const createInstanceSchema = z.object({
  name: z.string().min(1).max(100),
  config: z.string().min(1), // JSON string
});

// GET /api/personas/[id]/instances - Get persona instances
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const instances = await prisma.personaInstance.findMany({
      where: {
        personaId: params.id,
        userId: session.user.id
      },
      include: {
        persona: {
          select: {
            id: true,
            name: true,
            description: true
          }
        }
      },
      orderBy: { createdAt: 'desc' }
    });

    return NextResponse.json(instances);

  } catch (error) {
    console.error('Error fetching persona instances:', error);
    return NextResponse.json(
      { error: 'Failed to fetch persona instances' },
      { status: 500 }
    );
  }
}

// POST /api/personas/[id]/instances - Create persona instance
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
    const validatedData = createInstanceSchema.parse(body);

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

    // Check if user already has an instance with this name
    const existingInstance = await prisma.personaInstance.findFirst({
      where: {
        userId: session.user.id,
        name: validatedData.name
      }
    });

    if (existingInstance) {
      return NextResponse.json(
        { error: 'An instance with this name already exists' },
        { status: 400 }
      );
    }

    const instance = await prisma.personaInstance.create({
      data: {
        personaId: params.id,
        userId: session.user.id,
        name: validatedData.name,
        config: validatedData.config
      },
      include: {
        persona: {
          select: {
            id: true,
            name: true,
            description: true
          }
        }
      }
    });

    // Increment usage count
    await prisma.persona.update({
      where: { id: params.id },
      data: { usageCount: { increment: 1 } }
    });

    return NextResponse.json(instance, { status: 201 });

  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid input', details: error.errors },
        { status: 400 }
      );
    }

    console.error('Error creating persona instance:', error);
    return NextResponse.json(
      { error: 'Failed to create persona instance' },
      { status: 500 }
    );
  }
}
