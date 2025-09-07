import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { z } from 'zod';

const createReferralSchema = z.object({
  referredEmail: z.string().email(),
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

    const [referrals, total] = await Promise.all([
      prisma.referral.findMany({
        where: { referrerId: session.user.id },
        include: {
          referred: {
            select: {
              id: true,
              name: true,
              image: true,
              email: true,
              level: true,
              xp: true
            }
          }
        },
        orderBy: { createdAt: 'desc' },
        skip: (page - 1) * limit,
        take: limit
      }),
      prisma.referral.count({
        where: { referrerId: session.user.id }
      })
    ]);

    return NextResponse.json({
      referrals,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    });

  } catch (error) {
    console.error('Error fetching referrals:', error);
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
    const validatedData = createReferralSchema.parse(body);

    // Check if user is trying to refer themselves
    if (validatedData.referredEmail === session.user.email) {
      return NextResponse.json(
        { error: 'Cannot refer yourself' },
        { status: 400 }
      );
    }

    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email: validatedData.referredEmail }
    });

    if (existingUser) {
      return NextResponse.json(
        { error: 'User already exists' },
        { status: 400 }
      );
    }

    // Check if referral already exists
    const existingReferral = await prisma.referral.findFirst({
      where: {
        referrerId: session.user.id,
        referred: { email: validatedData.referredEmail }
      }
    });

    if (existingReferral) {
      return NextResponse.json(
        { error: 'Referral already exists' },
        { status: 400 }
      );
    }

    // Create referral
    const referral = await prisma.referral.create({
      data: {
        referrerId: session.user.id,
        referredEmail: validatedData.referredEmail,
        status: 'PENDING',
        rewardAmount: 50.0 // $50 reward for successful referral
      }
    });

    // Create ambassador activity
    const ambassador = await prisma.ambassadorProfile.findUnique({
      where: { userId: session.user.id }
    });

    if (ambassador) {
      await prisma.ambassadorActivity.create({
        data: {
          ambassadorId: ambassador.id,
          type: 'REFERRAL',
          description: `Referred ${validatedData.referredEmail}`,
          points: 10,
          earnings: 0, // Will be updated when referral is completed
          metadata: { referralId: referral.id }
        }
      });
    }

    return NextResponse.json(referral, { status: 201 });

  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Validation error', details: error.errors },
        { status: 400 }
      );
    }

    console.error('Error creating referral:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

