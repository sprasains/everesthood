import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { z } from 'zod';

const createSessionSchema = z.object({
  type: z.enum(['meditation', 'breathing', 'focus', 'break']),
  duration: z.number().min(1).max(120), // 1-120 minutes
  notes: z.string().optional(),
  moodBefore: z.number().min(1).max(10).optional(),
  moodAfter: z.number().min(1).max(10).optional(),
});

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const url = new URL(request.url);
    const type = url.searchParams.get('type');
    const limit = parseInt(url.searchParams.get('limit') || '10');
    const period = url.searchParams.get('period') || '7d'; // 7d, 30d, 90d

    // Calculate date range
    const now = new Date();
    const startDate = new Date(now);
    switch (period) {
      case '30d':
        startDate.setDate(now.getDate() - 30);
        break;
      case '90d':
        startDate.setDate(now.getDate() - 90);
        break;
      default: // 7d
        startDate.setDate(now.getDate() - 7);
    }

    const where: any = {
      userId: session.user.id,
      createdAt: { gte: startDate },
    };

    if (type) {
      where.type = type;
    }

    const [sessions, stats] = await Promise.all([
      prisma.wellnessSession.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        take: limit,
      }),
      prisma.wellnessSession.groupBy({
        by: ['type'],
        where: {
          userId: session.user.id,
          createdAt: { gte: startDate },
          completed: true,
        },
        _count: { type: true },
        _sum: { duration: true },
        _avg: { moodBefore: true, moodAfter: true },
      })
    ]);

    // Calculate wellness insights
    const totalSessions = sessions.filter(s => s.completed).length;
    const totalDuration = sessions.filter(s => s.completed).reduce((sum, s) => sum + s.duration, 0);
    const avgMoodImprovement = sessions
      .filter(s => s.moodBefore && s.moodAfter)
      .reduce((sum, s) => sum + (s.moodAfter! - s.moodBefore!), 0) / 
      sessions.filter(s => s.moodBefore && s.moodAfter).length || 0;

    return NextResponse.json({
      sessions,
      stats: {
        totalSessions,
        totalDuration,
        avgMoodImprovement: Math.round(avgMoodImprovement * 10) / 10,
        byType: stats,
      }
    });

  } catch (error) {
    console.error('Error fetching wellness data:', error);
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
    const validatedData = createSessionSchema.parse(body);

    const wellnessSession = await prisma.wellnessSession.create({
      data: {
        ...validatedData,
        userId: session.user.id,
        completed: false, // Will be updated when session ends
      }
    });

    return NextResponse.json(wellnessSession, { status: 201 });

  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Validation error', details: error.errors },
        { status: 400 }
      );
    }

    console.error('Error creating wellness session:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
