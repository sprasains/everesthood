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
    const type = searchParams.get('type');
    const featured = searchParams.get('featured');
    const search = searchParams.get('search');
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '20');

    const where: any = {
      status: 'published',
    };

    if (category) {
      where.category = category;
    }

    if (type) {
      where.type = type;
    }

    if (featured === 'true') {
      where.featured = true;
    }

    if (search) {
      where.OR = [
        { title: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } },
        { skills: { has: search } },
        { tags: { has: search } },
      ];
    }

    const [showcases, total] = await Promise.all([
      prisma.showcase.findMany({
        where,
        include: {
          author: {
            select: {
              id: true,
              name: true,
              image: true,
            },
          },
          comments: {
            select: {
              id: true,
            },
          },
          likes: {
            select: {
              id: true,
            },
          },
        },
        orderBy: [
          { featured: 'desc' },
          { createdAt: 'desc' },
        ],
        skip: (page - 1) * limit,
        take: limit,
      }),
      prisma.showcase.count({ where }),
    ]);

    // Add computed fields
    const showcasesWithMetrics = showcases.map(showcase => ({
      ...showcase,
      comments: showcase.comments.length,
      likes: showcase.likes.length,
      rating: 4.5, // Placeholder - would be calculated from reviews
    }));

    return NextResponse.json({
      showcases: showcasesWithMetrics,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error('Error fetching showcases:', error);
    return NextResponse.json(
      { error: 'Failed to fetch showcases' },
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
      tags, 
      skills, 
      impact, 
      duration, 
      teamSize, 
      technologies 
    } = body;

    if (!title || !description || !category) {
      return NextResponse.json(
        { error: 'Title, description, and category are required' },
        { status: 400 }
      );
    }

    const showcase = await prisma.showcase.create({
      data: {
        title,
        description,
        category,
        type: type || 'project',
        tags: tags || [],
        skills: skills || [],
        authorId: session.user.id,
        status: 'published',
        featured: false,
        views: 0,
        likes: 0,
        comments: 0,
        rating: 0,
        metrics: {
          impact: impact || '',
          duration: duration || '',
          teamSize: teamSize || 1,
          technologies: technologies || [],
        },
      },
      include: {
        author: {
          select: {
            id: true,
            name: true,
            image: true,
          },
        },
      },
    });

    return NextResponse.json({ showcase }, { status: 201 });
  } catch (error) {
    console.error('Error creating showcase:', error);
    return NextResponse.json(
      { error: 'Failed to create showcase' },
      { status: 500 }
    );
  }
}
