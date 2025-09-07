import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { z } from 'zod';

const createAmbassadorSchema = z.object({
  bio: z.string().max(500).optional(),
  socialLinks: z.object({
    linkedin: z.string().url().optional(),
    twitter: z.string().url().optional(),
    github: z.string().url().optional(),
    website: z.string().url().optional(),
  }).optional(),
  specialties: z.array(z.string()).default([]),
});

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const url = new URL(request.url);
    const includeStats = url.searchParams.get('includeStats') === 'true';

    // Get or create ambassador profile
    let ambassador = await prisma.ambassadorProfile.findUnique({
      where: { userId: session.user.id },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            image: true,
            email: true,
            level: true,
            xp: true
          }
        },
        ...(includeStats && {
          activities: {
            orderBy: { createdAt: 'desc' },
            take: 10
          },
          rewards: {
            where: { status: 'PENDING' },
            orderBy: { createdAt: 'desc' }
          }
        })
      }
    });

    if (!ambassador) {
      // Create ambassador profile if it doesn't exist
      ambassador = await prisma.ambassadorProfile.create({
        data: {
          userId: session.user.id,
          tier: 'BRONZE',
          status: 'ACTIVE'
        },
        include: {
          user: {
            select: {
              id: true,
              name: true,
              image: true,
              email: true,
              level: true,
              xp: true
            }
          },
          ...(includeStats && {
            activities: {
              orderBy: { createdAt: 'desc' },
              take: 10
            },
            rewards: {
              where: { status: 'PENDING' },
              orderBy: { createdAt: 'desc' }
            }
          })
        }
      });
    }

    // Get additional stats if requested
    let stats = null;
    if (includeStats) {
      const [totalActivities, totalRewards, monthlyEarnings] = await Promise.all([
        prisma.ambassadorActivity.count({
          where: { ambassadorId: ambassador.id }
        }),
        prisma.ambassadorReward.count({
          where: { ambassadorId: ambassador.id }
        }),
        prisma.ambassadorActivity.aggregate({
          where: {
            ambassadorId: ambassador.id,
            createdAt: {
              gte: new Date(new Date().getFullYear(), new Date().getMonth(), 1)
            }
          },
          _sum: { earnings: true }
        })
      ]);

      stats = {
        totalActivities,
        totalRewards,
        monthlyEarnings: monthlyEarnings._sum.earnings || 0
      };
    }

    return NextResponse.json({
      ambassador,
      stats
    });

  } catch (error) {
    console.error('Error fetching ambassador profile:', error);
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
    const validatedData = createAmbassadorSchema.parse(body);

    // Check if ambassador profile already exists
    const existingProfile = await prisma.ambassadorProfile.findUnique({
      where: { userId: session.user.id }
    });

    if (existingProfile) {
      return NextResponse.json(
        { error: 'Ambassador profile already exists' },
        { status: 400 }
      );
    }

    // Create ambassador profile
    const ambassador = await prisma.ambassadorProfile.create({
      data: {
        userId: session.user.id,
        tier: 'BRONZE',
        status: 'ACTIVE',
        ...validatedData
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            image: true,
            email: true,
            level: true,
            xp: true
          }
        }
      }
    });

    // Create welcome reward
    await prisma.ambassadorReward.create({
      data: {
        ambassadorId: ambassador.id,
        type: 'CREDITS',
        title: 'Welcome to the Ambassador Program!',
        description: 'You\'ve received 100 credits for joining our ambassador program.',
        value: 100.0,
        status: 'PENDING'
      }
    });

    return NextResponse.json(ambassador, { status: 201 });

  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Validation error', details: error.errors },
        { status: 400 }
      );
    }

    console.error('Error creating ambassador profile:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const validatedData = createAmbassadorSchema.parse(body);

    // Update ambassador profile
    const ambassador = await prisma.ambassadorProfile.update({
      where: { userId: session.user.id },
      data: {
        ...validatedData,
        updatedAt: new Date()
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            image: true,
            email: true,
            level: true,
            xp: true
          }
        }
      }
    });

    return NextResponse.json(ambassador);

  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Validation error', details: error.errors },
        { status: 400 }
      );
    }

    console.error('Error updating ambassador profile:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

