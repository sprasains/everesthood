import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const url = new URL(request.url);
    const status = url.searchParams.get('status') || 'PENDING';
    const page = parseInt(url.searchParams.get('page') || '1');
    const limit = parseInt(url.searchParams.get('limit') || '20');

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

    if (status !== 'ALL') {
      where.status = status;
    }

    const [rewards, total] = await Promise.all([
      prisma.ambassadorReward.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip: (page - 1) * limit,
        take: limit
      }),
      prisma.ambassadorReward.count({ where })
    ]);

    return NextResponse.json({
      rewards,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    });

  } catch (error) {
    console.error('Error fetching ambassador rewards:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

