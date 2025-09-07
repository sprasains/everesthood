import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { z } from 'zod';

const createStepSchema = z.object({
  title: z.string().min(1).max(200),
  content: z.string().min(1),
  type: z.enum(['TEXT', 'IMAGE', 'VIDEO', 'CODE', 'QUIZ', 'EXERCISE']).default('TEXT'),
  order: z.number().min(0),
  isOptional: z.boolean().default(false),
  estimatedTime: z.number().min(1).optional(),
  mediaUrl: z.string().url().optional(),
  codeLanguage: z.string().optional(),
  quizData: z.string().optional(), // JSON string
});

const updateStepSchema = createStepSchema.partial();

// GET /api/guides/[id]/steps - Get guide steps
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Check if guide exists and user can access it
    const guide = await prisma.guide.findUnique({
      where: { id: params.id },
      select: { id: true, userId: true, isPublic: true }
    });

    if (!guide) {
      return NextResponse.json({ error: 'Guide not found' }, { status: 404 });
    }

    if (!guide.isPublic && guide.userId !== session.user.id) {
      return NextResponse.json({ error: 'Access denied' }, { status: 403 });
    }

    const steps = await prisma.guideStep.findMany({
      where: { guideId: params.id },
      orderBy: { order: 'asc' }
    });

    return NextResponse.json(steps);

  } catch (error) {
    console.error('Error fetching guide steps:', error);
    return NextResponse.json(
      { error: 'Failed to fetch guide steps' },
      { status: 500 }
    );
  }
}

// POST /api/guides/[id]/steps - Create guide step
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
    const validatedData = createStepSchema.parse(body);

    // Check if guide exists and user owns it
    const guide = await prisma.guide.findUnique({
      where: { id: params.id }
    });

    if (!guide) {
      return NextResponse.json({ error: 'Guide not found' }, { status: 404 });
    }

    if (guide.userId !== session.user.id) {
      return NextResponse.json({ error: 'Access denied' }, { status: 403 });
    }

    // Check if step order already exists
    const existingStep = await prisma.guideStep.findFirst({
      where: {
        guideId: params.id,
        order: validatedData.order
      }
    });

    if (existingStep) {
      return NextResponse.json(
        { error: 'A step with this order already exists' },
        { status: 400 }
      );
    }

    const step = await prisma.guideStep.create({
      data: {
        ...validatedData,
        guideId: params.id
      }
    });

    return NextResponse.json(step, { status: 201 });

  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid input', details: error.errors },
        { status: 400 }
      );
    }

    console.error('Error creating guide step:', error);
    return NextResponse.json(
      { error: 'Failed to create guide step' },
      { status: 500 }
    );
  }
}
