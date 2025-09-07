import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { z } from 'zod';

const createHealthMetricSchema = z.object({
  metric: z.string().min(1).max(100),
  value: z.number().min(0),
  unit: z.string().min(1).max(20),
  date: z.string().datetime(),
  notes: z.string().optional(),
  category: z.enum(['fitness', 'vitals', 'nutrition', 'sleep', 'mental'])
});

const createHealthGoalSchema = z.object({
  title: z.string().min(1).max(100),
  description: z.string().min(1).max(500),
  targetValue: z.number().min(0),
  currentValue: z.number().min(0),
  unit: z.string().min(1).max(20),
  deadline: z.string().datetime(),
  category: z.string().min(1).max(50)
});

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const url = new URL(request.url);
    const type = url.searchParams.get('type') || 'metrics';
    const category = url.searchParams.get('category');
    const limit = parseInt(url.searchParams.get('limit') || '50');

    if (type === 'metrics') {
      const where: any = { userId: session.user.id };
      if (category) where.category = category;

      const metrics = await prisma.healthMetric.findMany({
        where,
        orderBy: { date: 'desc' },
        take: limit
      });

      return NextResponse.json({ metrics });
    }

    if (type === 'goals') {
      const where: any = { userId: session.user.id };
      if (category) where.category = category;

      const goals = await prisma.healthGoal.findMany({
        where,
        orderBy: { deadline: 'asc' }
      });

      return NextResponse.json({ goals });
    }

    return NextResponse.json({ error: 'Invalid type parameter' }, { status: 400 });

  } catch (error) {
    console.error('Error fetching health data:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const url = new URL(request.url);
    const type = url.searchParams.get('type') || 'metric';

    if (type === 'metric') {
      const validatedData = createHealthMetricSchema.parse(body);

      const metric = await prisma.healthMetric.create({
        data: {
          userId: session.user.id,
          ...validatedData
        }
      });

      return NextResponse.json(metric, { status: 201 });
    }

    if (type === 'goal') {
      const validatedData = createHealthGoalSchema.parse(body);

      const goal = await prisma.healthGoal.create({
        data: {
          userId: session.user.id,
          ...validatedData,
          progress: (validatedData.currentValue / validatedData.targetValue) * 100
        }
      });

      return NextResponse.json(goal, { status: 201 });
    }

    return NextResponse.json({ error: 'Invalid type parameter' }, { status: 400 });

  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Validation error', details: error.errors },
        { status: 400 }
      );
    }

    console.error('Error creating health data:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
