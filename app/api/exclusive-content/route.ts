import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { z } from 'zod';

const createContentSchema = z.object({
  title: z.string().min(1).max(200),
  description: z.string().min(1).max(1000),
  content: z.string().min(1),
  type: z.enum(['ARTICLE', 'VIDEO', 'AUDIO', 'DOCUMENT', 'COURSE', 'WORKSHOP']),
  category: z.enum(['TECHNOLOGY', 'BUSINESS', 'CREATIVITY', 'EDUCATION', 'LIFESTYLE']),
  tags: z.array(z.string()).default([]),
  tier: z.enum(['FREE', 'PREMIUM', 'VIP', 'EXCLUSIVE']).default('PREMIUM'),
  price: z.number().min(0).default(0),
  thumbnailUrl: z.string().url().optional(),
  mediaUrls: z.array(z.string().url()).default([]),
  duration: z.number().min(0).optional(),
  difficulty: z.enum(['BEGINNER', 'INTERMEDIATE', 'ADVANCED']).optional(),
  prerequisites: z.array(z.string()).default([]),
  learningOutcomes: z.array(z.string()).default([]),
});

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const url = new URL(request.url);
    const page = parseInt(url.searchParams.get('page') || '1');
    const limit = parseInt(url.searchParams.get('limit') || '12');
    const type = url.searchParams.get('type');
    const category = url.searchParams.get('category');
    const tier = url.searchParams.get('tier');
    const featured = url.searchParams.get('featured') === 'true';
    const search = url.searchParams.get('search');

    const where: any = {
      isPublished: true,
      deletedAt: null
    };

    if (type) {
      where.type = type;
    }

    if (category) {
      where.category = category;
    }

    if (tier) {
      where.tier = tier;
    }

    if (featured) {
      where.featured = true;
    }

    if (search) {
      where.OR = [
        { title: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } },
        { tags: { hasSome: [search] } }
      ];
    }

    const [content, total] = await Promise.all([
      prisma.exclusiveContent.findMany({
        where,
        include: {
          author: {
            select: {
              id: true,
              name: true,
              image: true,
              level: true,
              xp: true
            }
          },
          accessRecords: {
            where: { userId: session.user.id, isActive: true },
            select: { id: true, accessType: true }
          },
          _count: {
            select: {
              comments: {
                where: { isApproved: true, deletedAt: null }
              }
            }
          }
        },
        orderBy: [
          { featured: 'desc' },
          { publishedAt: 'desc' }
        ],
        skip: (page - 1) * limit,
        take: limit
      }),
      prisma.exclusiveContent.count({ where })
    ]);

    // Mark content as accessible if user has access
    const contentWithAccess = content.map(item => ({
      ...item,
      hasAccess: item.accessRecords.length > 0 || item.tier === 'FREE' || item.authorId === session.user.id
    }));

    return NextResponse.json({
      content: contentWithAccess,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    });

  } catch (error) {
    console.error('Error fetching exclusive content:', error);
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
    const validatedData = createContentSchema.parse(body);

    // Create exclusive content
    const content = await prisma.exclusiveContent.create({
      data: {
        ...validatedData,
        authorId: session.user.id,
        isPublished: false // Draft by default
      },
      include: {
        author: {
          select: {
            id: true,
            name: true,
            image: true,
            level: true,
            xp: true
          }
        }
      }
    });

    return NextResponse.json(content, { status: 201 });

  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Validation error', details: error.errors },
        { status: 400 }
      );
    }

    console.error('Error creating exclusive content:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

