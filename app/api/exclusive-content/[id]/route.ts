import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { z } from 'zod';

const updateContentSchema = z.object({
  title: z.string().min(1).max(200).optional(),
  description: z.string().min(1).max(1000).optional(),
  content: z.string().min(1).optional(),
  type: z.enum(['ARTICLE', 'VIDEO', 'AUDIO', 'DOCUMENT', 'COURSE', 'WORKSHOP']).optional(),
  category: z.enum(['TECHNOLOGY', 'BUSINESS', 'CREATIVITY', 'EDUCATION', 'LIFESTYLE']).optional(),
  tags: z.array(z.string()).optional(),
  tier: z.enum(['FREE', 'PREMIUM', 'VIP', 'EXCLUSIVE']).optional(),
  price: z.number().min(0).optional(),
  thumbnailUrl: z.string().url().optional(),
  mediaUrls: z.array(z.string().url()).optional(),
  duration: z.number().min(0).optional(),
  difficulty: z.enum(['BEGINNER', 'INTERMEDIATE', 'ADVANCED']).optional(),
  prerequisites: z.array(z.string()).optional(),
  learningOutcomes: z.array(z.string()).optional(),
  isPublished: z.boolean().optional(),
});

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const contentId = params.id;

    const content = await prisma.exclusiveContent.findUnique({
      where: { 
        id: contentId,
        deletedAt: null
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
        },
        accessRecords: {
          where: { userId: session.user.id, isActive: true },
          select: { id: true, accessType: true, grantedAt: true, expiresAt: true }
        },
        comments: {
          where: { isApproved: true, deletedAt: null },
          include: {
            user: {
              select: {
                id: true,
                name: true,
                image: true
              }
            },
            replies: {
              where: { isApproved: true, deletedAt: null },
              include: {
                user: {
                  select: {
                    id: true,
                    name: true,
                    image: true
                  }
                }
              },
              orderBy: { createdAt: 'asc' }
            }
          },
          orderBy: { createdAt: 'desc' }
        },
        _count: {
          select: {
            comments: {
              where: { isApproved: true, deletedAt: null }
            }
          }
        }
      }
    });

    if (!content) {
      return NextResponse.json({ error: 'Content not found' }, { status: 404 });
    }

    // Check if user has access
    const hasAccess = content.accessRecords.length > 0 || 
                     content.tier === 'FREE' || 
                     content.authorId === session.user.id;

    if (!hasAccess && content.isPublished) {
      return NextResponse.json({ 
        error: 'Access denied',
        content: {
          id: content.id,
          title: content.title,
          description: content.description,
          tier: content.tier,
          price: content.price,
          author: content.author,
          hasAccess: false
        }
      }, { status: 403 });
    }

    // Increment view count if user has access
    if (hasAccess && content.isPublished) {
      await prisma.exclusiveContent.update({
        where: { id: contentId },
        data: { viewCount: { increment: 1 } }
      });
    }

    return NextResponse.json({
      ...content,
      hasAccess
    });

  } catch (error) {
    console.error('Error fetching exclusive content:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const contentId = params.id;
    const body = await request.json();
    const validatedData = updateContentSchema.parse(body);

    // Check if user owns the content
    const existingContent = await prisma.exclusiveContent.findUnique({
      where: { id: contentId },
      select: { authorId: true }
    });

    if (!existingContent) {
      return NextResponse.json({ error: 'Content not found' }, { status: 404 });
    }

    if (existingContent.authorId !== session.user.id) {
      return NextResponse.json({ error: 'Not authorized to edit this content' }, { status: 403 });
    }

    // Update content
    const updatedContent = await prisma.exclusiveContent.update({
      where: { id: contentId },
      data: {
        ...validatedData,
        ...(validatedData.isPublished && !existingContent.publishedAt && { publishedAt: new Date() }),
        updatedAt: new Date()
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

    return NextResponse.json(updatedContent);

  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Validation error', details: error.errors },
        { status: 400 }
      );
    }

    console.error('Error updating exclusive content:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const contentId = params.id;

    // Check if user owns the content
    const existingContent = await prisma.exclusiveContent.findUnique({
      where: { id: contentId },
      select: { authorId: true }
    });

    if (!existingContent) {
      return NextResponse.json({ error: 'Content not found' }, { status: 404 });
    }

    if (existingContent.authorId !== session.user.id) {
      return NextResponse.json({ error: 'Not authorized to delete this content' }, { status: 403 });
    }

    // Soft delete the content
    await prisma.exclusiveContent.update({
      where: { id: contentId },
      data: { deletedAt: new Date() }
    });

    return NextResponse.json({ message: 'Content deleted successfully' });

  } catch (error) {
    console.error('Error deleting exclusive content:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

