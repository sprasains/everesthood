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

    const { searchParams } = new URL(request.url);
    const category = searchParams.get('category');
    const status = searchParams.get('status');
    const search = searchParams.get('search');
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '20');

    const where: any = {};

    if (category) {
      where.category = category;
    }

    if (status) {
      where.status = status;
    }

    if (search) {
      where.OR = [
        { title: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } },
        { tags: { has: search } },
      ];
    }

    const [challenges, total] = await Promise.all([
      prisma.challenge.findMany({
        where,
        include: {
          organizer: {
            select: {
              id: true,
              name: true,
              image: true,
            },
          },
          participants: {
            include: {
              user: {
                select: {
                  id: true,
                  name: true,
                  image: true,
                },
              },
            },
          },
        },
        orderBy: { createdAt: 'desc' },
        skip: (page - 1) * limit,
        take: limit,
      }),
      prisma.challenge.count({ where }),
    ]);

    // Add isJoined flag for current user
    const challengesWithParticipation = challenges.map(challenge => ({
      ...challenge,
      participants: challenge.participants.length,
      isJoined: challenge.participants.some(participant => participant.userId === session.user.id),
    }));

    return NextResponse.json({
      challenges: challengesWithParticipation,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error('Error fetching challenges:', error);
    return NextResponse.json(
      { error: 'Failed to fetch challenges' },
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
    const { 
      title, 
      description, 
      category, 
      type, 
      startDate, 
      endDate, 
      prize, 
      maxParticipants, 
      difficulty, 
      tags, 
      requirements, 
      judgingCriteria 
    } = body;

    if (!title || !description || !category || !startDate || !endDate) {
      return NextResponse.json(
        { error: 'Title, description, category, start date, and end date are required' },
        { status: 400 }
      );
    }

    const challenge = await prisma.challenge.create({
      data: {
        title,
        description,
        category,
        type: type || 'challenge',
        startDate: new Date(startDate),
        endDate: new Date(endDate),
        prize: prize || '',
        maxParticipants: maxParticipants || 100,
        difficulty: difficulty || 'intermediate',
        tags: tags || [],
        requirements: requirements || [],
        judgingCriteria: judgingCriteria || [],
        organizerId: session.user.id,
        status: 'upcoming',
      },
      include: {
        organizer: {
          select: {
            id: true,
            name: true,
            image: true,
          },
        },
      },
    });

    return NextResponse.json({ challenge }, { status: 201 });
  } catch (error) {
    console.error('Error creating challenge:', error);
    return NextResponse.json(
      { error: 'Failed to create challenge' },
      { status: 500 }
    );
  }
}
