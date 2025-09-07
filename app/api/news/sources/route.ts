import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { z } from 'zod';

const createSourceSchema = z.object({
  name: z.string().min(1).max(200),
  url: z.string().url(),
  description: z.string().optional(),
  type: z.enum(['RSS', 'API', 'MANUAL', 'SCRAPED']).default('RSS'),
  categories: z.array(z.string()).default([]),
  tags: z.array(z.string()).default([]),
  fetchInterval: z.number().min(300).max(86400).default(3600), // 5 minutes to 24 hours
});

const updateSourceSchema = createSourceSchema.partial();

// GET /api/news/sources - Get available news sources
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const category = searchParams.get('category') || '';
    const active = searchParams.get('active') === 'true';
    const type = searchParams.get('type') || '';
    const search = searchParams.get('search') || '';
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '20');
    const skip = (page - 1) * limit;

    const where: any = {};
    
    if (active) {
      where.isActive = true;
    }

    if (category) {
      where.categories = { has: category };
    }

    if (type) {
      where.type = type;
    }

    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } },
        { tags: { hasSome: [search.toLowerCase()] } }
      ];
    }

    const [sources, total] = await Promise.all([
      prisma.newsSource.findMany({
        where,
        include: {
          _count: {
            select: {
              articles: true
            }
          }
        },
        orderBy: { name: 'asc' },
        skip,
        take: limit
      }),
      prisma.newsSource.count({ where })
    ]);

    return NextResponse.json({
      sources,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    });

  } catch (error) {
    console.error('Error fetching news sources:', error);
    return NextResponse.json(
      { error: 'Failed to fetch news sources' },
      { status: 500 }
    );
  }
}

// POST /api/news/sources - Create new news source (admin only)
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Check if user is admin
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { role: true }
    });

    if (user?.role !== 'ADMIN' && user?.role !== 'SUPER_ADMIN') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const body = await request.json();
    const validatedData = createSourceSchema.parse(body);

    // Check if source with same URL already exists
    const existingSource = await prisma.newsSource.findFirst({
      where: { url: validatedData.url }
    });

    if (existingSource) {
      return NextResponse.json(
        { error: 'A source with this URL already exists' },
        { status: 400 }
      );
    }

    const source = await prisma.newsSource.create({
      data: validatedData,
      include: {
        _count: {
          select: {
            articles: true
          }
        }
      }
    });

    return NextResponse.json(source, { status: 201 });

  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid input', details: error.errors },
        { status: 400 }
      );
    }

    console.error('Error creating news source:', error);
    return NextResponse.json(
      { error: 'Failed to create news source' },
      { status: 500 }
    );
  }
}
