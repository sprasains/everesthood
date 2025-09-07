import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { z } from 'zod';

const createActivitySchema = z.object({
  type: z.enum(['REFERRAL', 'SOCIAL_SHARE', 'CONTENT_CREATION', 'COMMUNITY_ENGAGEMENT', 'EVENT_PARTICIPATION']),
  description: z.string().min(1).max(500),
  points: z.number().min(0).default(0),
  earnings: z.number().min(0).default(0),
  metadata: z.record(z.any()).optional(),
});

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const url = new URL(request.url);
    const page = parseInt(url.searchParams.get('page') || '1');
    const limit = parseInt(url.searchParams.get('limit') || '20');
    const type = url.searchParams.get('type');

    // Get ambassador profile
    const ambassador = await prisma.ambassadorProfile.findUnique({
      where: { userId: session.user.id }
    });

    if (!ambassador) {
      return NextResponse.json({ error: 'Ambassador profile not found' }, { status: 404 });
    }

    const where: any = {
      ambassadorId: ambassador.id
    };

    if (type) {
      where.type = type;
    }

    const [activities, total] = await Promise.all([
      prisma.ambassadorActivity.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip: (page - 1) * limit,
        take: limit
      }),
      prisma.ambassadorActivity.count({ where })
    ]);

    return NextResponse.json({
      activities,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    });

  } catch (error) {
    console.error('Error fetching ambassador activities:', error);
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
    const validatedData = createActivitySchema.parse(body);

    // Get ambassador profile
    const ambassador = await prisma.ambassadorProfile.findUnique({
      where: { userId: session.user.id }
    });

    if (!ambassador) {
      return NextResponse.json({ error: 'Ambassador profile not found' }, { status: 404 });
    }

    // Create activity
    const activity = await prisma.ambassadorActivity.create({
      data: {
        ambassadorId: ambassador.id,
        ...validatedData
      }
    });

    // Update ambassador stats
    await prisma.ambassadorProfile.update({
      where: { id: ambassador.id },
      data: {
        totalEarnings: ambassador.totalEarnings + validatedData.earnings,
        monthlyEarnings: ambassador.monthlyEarnings + validatedData.earnings,
        lifetimeEarnings: ambassador.lifetimeEarnings + validatedData.earnings,
        lastActivity: new Date()
      }
    });

    return NextResponse.json(activity, { status: 201 });

  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Validation error', details: error.errors },
        { status: 400 }
      );
    }

    console.error('Error creating ambassador activity:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

