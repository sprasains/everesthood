import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { z } from 'zod';

const updateProgressSchema = z.object({
  completedSteps: z.array(z.string()).optional(),
  currentStep: z.string().optional(),
  timeSpent: z.number().min(0).optional(),
});

// GET /api/guides/[id]/progress - Get user's progress on guide
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const progress = await prisma.guideProgress.findUnique({
      where: {
        guideId_userId: {
          guideId: params.id,
          userId: session.user.id
        }
      },
      include: {
        guide: {
          select: {
            id: true,
            title: true,
            _count: {
              select: {
                steps: true
              }
            }
          }
        }
      }
    });

    if (!progress) {
      return NextResponse.json({ progress: null });
    }

    return NextResponse.json(progress);

  } catch (error) {
    console.error('Error fetching guide progress:', error);
    return NextResponse.json(
      { error: 'Failed to fetch guide progress' },
      { status: 500 }
    );
  }
}

// POST /api/guides/[id]/progress - Update user's progress on guide
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
    const validatedData = updateProgressSchema.parse(body);

    // Check if guide exists
    const guide = await prisma.guide.findUnique({
      where: { id: params.id },
      include: {
        _count: {
          select: {
            steps: true
          }
        }
      }
    });

    if (!guide) {
      return NextResponse.json({ error: 'Guide not found' }, { status: 404 });
    }

    // Calculate progress percentage
    const totalSteps = guide._count.steps;
    const completedSteps = validatedData.completedSteps || [];
    const progressPercentage = totalSteps > 0 ? (completedSteps.length / totalSteps) * 100 : 0;

    // Check if guide is completed
    const isCompleted = progressPercentage >= 100;

    const progress = await prisma.guideProgress.upsert({
      where: {
        guideId_userId: {
          guideId: params.id,
          userId: session.user.id
        }
      },
      update: {
        completedSteps: validatedData.completedSteps,
        currentStep: validatedData.currentStep,
        progress: progressPercentage,
        timeSpent: validatedData.timeSpent,
        isCompleted,
        completedAt: isCompleted ? new Date() : null
      },
      create: {
        guideId: params.id,
        userId: session.user.id,
        completedSteps: validatedData.completedSteps || [],
        currentStep: validatedData.currentStep,
        progress: progressPercentage,
        timeSpent: validatedData.timeSpent || 0,
        isCompleted,
        completedAt: isCompleted ? new Date() : null
      }
    });

    return NextResponse.json(progress);

  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid input', details: error.errors },
        { status: 400 }
      );
    }

    console.error('Error updating guide progress:', error);
    return NextResponse.json(
      { error: 'Failed to update guide progress' },
      { status: 500 }
    );
  }
}
