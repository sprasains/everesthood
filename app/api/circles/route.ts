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
    const search = searchParams.get('search');
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '20');

    const where: any = {};

    if (category) {
      where.category = category;
    }

    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } },
        { tags: { has: search } },
      ];
    }

    const [circles, total] = await Promise.all([
      prisma.circle.findMany({
        where,
        include: {
          owner: {
            select: {
              id: true,
              name: true,
              image: true,
            },
          },
          members: {
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
      prisma.circle.count({ where }),
    ]);

    // Add isJoined flag for current user
    const circlesWithMembership = circles.map(circle => ({
      ...circle,
      memberCount: circle.members.length,
      isJoined: circle.members.some(member => member.userId === session.user.id),
    }));

    return NextResponse.json({
      circles: circlesWithMembership,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error('Error fetching circles:', error);
    return NextResponse.json(
      { error: 'Failed to fetch circles' },
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
    const { name, description, category, isPrivate, maxMembers, tags } = body;

    if (!name || !description || !category) {
      return NextResponse.json(
        { error: 'Name, description, and category are required' },
        { status: 400 }
      );
    }

    const circle = await prisma.circle.create({
      data: {
        name,
        description,
        category,
        isPrivate: isPrivate || false,
        maxMembers: maxMembers || 50,
        tags: tags || [],
        ownerId: session.user.id,
      },
      include: {
        owner: {
          select: {
            id: true,
            name: true,
            image: true,
          },
        },
        members: {
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
    });

    // Add owner as first member
    await prisma.circleMember.create({
      data: {
        circleId: circle.id,
        userId: session.user.id,
        role: 'owner',
      },
    });

    return NextResponse.json({ circle }, { status: 201 });
  } catch (error) {
    console.error('Error creating circle:', error);
    return NextResponse.json(
      { error: 'Failed to create circle' },
      { status: 500 }
    );
  }
}
