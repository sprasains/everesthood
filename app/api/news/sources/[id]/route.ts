import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { z } from 'zod';

const updateSourceSchema = z.object({
  name: z.string().min(1).max(200).optional(),
  url: z.string().url().optional(),
  description: z.string().optional(),
  type: z.enum(['RSS', 'API', 'MANUAL', 'SCRAPED']).optional(),
  isActive: z.boolean().optional(),
  categories: z.array(z.string()).optional(),
  tags: z.array(z.string()).optional(),
  fetchInterval: z.number().min(300).max(86400).optional(),
});

// GET /api/news/sources/[id] - Get specific news source
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const source = await prisma.newsSource.findUnique({
      where: { id: params.id },
      include: {
        _count: {
          select: {
            articles: true
          }
        },
        articles: {
          orderBy: { publishedAt: 'desc' },
          take: 10,
          select: {
            id: true,
            title: true,
            publishedAt: true,
            viewCount: true,
            likeCount: true,
            isFeatured: true,
            isTrending: true
          }
        }
      }
    });

    if (!source) {
      return NextResponse.json({ error: 'Source not found' }, { status: 404 });
    }

    return NextResponse.json(source);

  } catch (error) {
    console.error('Error fetching news source:', error);
    return NextResponse.json(
      { error: 'Failed to fetch news source' },
      { status: 500 }
    );
  }
}

// PUT /api/news/sources/[id] - Update news source (admin only)
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
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
    const validatedData = updateSourceSchema.parse(body);

    // Check if source exists
    const existingSource = await prisma.newsSource.findUnique({
      where: { id: params.id }
    });

    if (!existingSource) {
      return NextResponse.json({ error: 'Source not found' }, { status: 404 });
    }

    // Check if URL is being changed and if it conflicts
    if (validatedData.url && validatedData.url !== existingSource.url) {
      const urlConflict = await prisma.newsSource.findFirst({
        where: {
          url: validatedData.url,
          id: { not: params.id }
        }
      });

      if (urlConflict) {
        return NextResponse.json(
          { error: 'A source with this URL already exists' },
          { status: 400 }
        );
      }
    }

    const source = await prisma.newsSource.update({
      where: { id: params.id },
      data: validatedData,
      include: {
        _count: {
          select: {
            articles: true
          }
        }
      }
    });

    return NextResponse.json(source);

  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid input', details: error.errors },
        { status: 400 }
      );
    }

    console.error('Error updating news source:', error);
    return NextResponse.json(
      { error: 'Failed to update news source' },
      { status: 500 }
    );
  }
}

// DELETE /api/news/sources/[id] - Delete news source (admin only)
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
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

    // Check if source exists
    const existingSource = await prisma.newsSource.findUnique({
      where: { id: params.id }
    });

    if (!existingSource) {
      return NextResponse.json({ error: 'Source not found' }, { status: 404 });
    }

    // Delete source and all related articles (cascade)
    await prisma.newsSource.delete({
      where: { id: params.id }
    });

    return NextResponse.json({ message: 'Source deleted successfully' });

  } catch (error) {
    console.error('Error deleting news source:', error);
    return NextResponse.json(
      { error: 'Failed to delete news source' },
      { status: 500 }
    );
  }
}
