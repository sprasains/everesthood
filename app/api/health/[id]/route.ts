import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { z } from 'zod';

const updateHealthMetricSchema = z.object({
  metric: z.string().min(1).max(100).optional(),
  value: z.number().min(0).optional(),
  unit: z.string().min(1).max(20).optional(),
  date: z.string().datetime().optional(),
  notes: z.string().optional(),
  category: z.enum(['fitness', 'vitals', 'nutrition', 'sleep', 'mental']).optional()
});

const updateHealthGoalSchema = z.object({
  title: z.string().min(1).max(100).optional(),
  description: z.string().min(1).max(500).optional(),
  targetValue: z.number().min(0).optional(),
  currentValue: z.number().min(0).optional(),
  unit: z.string().min(1).max(20).optional(),
  deadline: z.string().datetime().optional(),
  category: z.string().min(1).max(50).optional()
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

    const url = new URL(request.url);
    const type = url.searchParams.get('type') || 'metric';

    if (type === 'metric') {
      const metric = await prisma.healthMetric.findUnique({
        where: { 
          id: params.id,
          userId: session.user.id
        }
      });

      if (!metric) {
        return NextResponse.json({ error: 'Health metric not found' }, { status: 404 });
      }

      return NextResponse.json(metric);
    }

    if (type === 'goal') {
      const goal = await prisma.healthGoal.findUnique({
        where: { 
          id: params.id,
          userId: session.user.id
        }
      });

      if (!goal) {
        return NextResponse.json({ error: 'Health goal not found' }, { status: 404 });
      }

      return NextResponse.json(goal);
    }

    return NextResponse.json({ error: 'Invalid type parameter' }, { status: 400 });

  } catch (error) {
    console.error('Error fetching health item:', error);
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
    const url = new URL(request.url);
    const type = url.searchParams.get('type') || 'metric';

    if (type === 'metric') {
      const validatedData = updateHealthMetricSchema.parse(body);

      const metric = await prisma.healthMetric.update({
        where: { 
          id: params.id,
          userId: session.user.id
        },
        data: validatedData
      });

      return NextResponse.json(metric);
    }

    if (type === 'goal') {
      const validatedData = updateHealthGoalSchema.parse(body);

      const updateData: any = { ...validatedData };
      if (validatedData.currentValue && validatedData.targetValue) {
        updateData.progress = (validatedData.currentValue / validatedData.targetValue) * 100;
      }

      const goal = await prisma.healthGoal.update({
        where: { 
          id: params.id,
          userId: session.user.id
        },
        data: updateData
      });

      return NextResponse.json(goal);
    }

    return NextResponse.json({ error: 'Invalid type parameter' }, { status: 400 });

  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Validation error', details: error.errors },
        { status: 400 }
      );
    }

    console.error('Error updating health item:', error);
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

    const url = new URL(request.url);
    const type = url.searchParams.get('type') || 'metric';

    if (type === 'metric') {
      await prisma.healthMetric.delete({
        where: { 
          id: params.id,
          userId: session.user.id
        }
      });

      return NextResponse.json({ message: 'Health metric deleted successfully' });
    }

    if (type === 'goal') {
      await prisma.healthGoal.delete({
        where: { 
          id: params.id,
          userId: session.user.id
        }
      });

      return NextResponse.json({ message: 'Health goal deleted successfully' });
    }

    return NextResponse.json({ error: 'Invalid type parameter' }, { status: 400 });

  } catch (error) {
    console.error('Error deleting health item:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
