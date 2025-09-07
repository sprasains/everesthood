import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { z } from 'zod';

const updateSessionSchema = z.object({
  completed: z.boolean().optional(),
  notes: z.string().optional(),
  moodBefore: z.number().min(1).max(10).optional(),
  moodAfter: z.number().min(1).max(10).optional(),
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

    const wellnessSession = await prisma.wellnessSession.findFirst({
      where: {
        id: params.id,
        userId: session.user.id,
      }
    });

    if (!wellnessSession) {
      return NextResponse.json({ error: 'Session not found' }, { status: 404 });
    }

    return NextResponse.json(wellnessSession);

  } catch (error) {
    console.error('Error fetching wellness session:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

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
    const validatedData = updateSessionSchema.parse(body);

    const wellnessSession = await prisma.wellnessSession.findFirst({
      where: {
        id: params.id,
        userId: session.user.id,
      }
    });

    if (!wellnessSession) {
      return NextResponse.json({ error: 'Session not found' }, { status: 404 });
    }

    const updatedSession = await prisma.wellnessSession.update({
      where: { id: params.id },
      data: validatedData,
    });

    return NextResponse.json(updatedSession);

  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Validation error', details: error.errors },
        { status: 400 }
      );
    }

    console.error('Error updating wellness session:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const wellnessSession = await prisma.wellnessSession.findFirst({
      where: {
        id: params.id,
        userId: session.user.id,
      }
    });

    if (!wellnessSession) {
      return NextResponse.json({ error: 'Session not found' }, { status: 404 });
    }

    await prisma.wellnessSession.delete({
      where: { id: params.id }
    });

    return NextResponse.json({ message: 'Session deleted successfully' });

  } catch (error) {
    console.error('Error deleting wellness session:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
