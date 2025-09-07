import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { z } from 'zod';

const createSummarySchema = z.object({
  title: z.string().min(1).max(200),
  content: z.string().min(1).max(50000),
  sourceType: z.enum(['url', 'text', 'document', 'video', 'audio']),
  sourceUrl: z.string().url().optional(),
  sourceText: z.string().optional(),
  tags: z.array(z.string()).default([]),
  isPublic: z.boolean().default(false),
});

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const url = new URL(request.url);
    const page = parseInt(url.searchParams.get('page') || '1');
    const limit = parseInt(url.searchParams.get('limit') || '10');
    const sourceType = url.searchParams.get('sourceType');
    const isPublic = url.searchParams.get('isPublic');
    const search = url.searchParams.get('search');

    const where: any = {
      userId: session.user.id,
      deletedAt: null,
    };

    if (sourceType) {
      where.sourceType = sourceType;
    }

    if (isPublic !== null) {
      where.isPublic = isPublic === 'true';
    }

    if (search) {
      where.OR = [
        { title: { contains: search, mode: 'insensitive' } },
        { content: { contains: search, mode: 'insensitive' } },
        { summary: { contains: search, mode: 'insensitive' } },
      ];
    }

    const [summaries, total] = await Promise.all([
      prisma.aISummary.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip: (page - 1) * limit,
        take: limit,
        include: {
          user: {
            select: { id: true, name: true, image: true }
          }
        }
      }),
      prisma.aISummary.count({ where })
    ]);

    return NextResponse.json({
      summaries,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    });

  } catch (error) {
    console.error('Error fetching summaries:', error);
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
    const validatedData = createSummarySchema.parse(body);

    // Create summary record
    const summary = await prisma.aISummary.create({
      data: {
        ...validatedData,
        userId: session.user.id,
        status: 'PENDING',
        summary: '', // Will be filled by AI processing
      }
    });

    // TODO: Queue AI processing job
    // For now, simulate AI processing
    setTimeout(async () => {
      try {
        const aiSummary = await generateAISummary(validatedData.content);
        await prisma.aISummary.update({
          where: { id: summary.id },
          data: {
            summary: aiSummary,
            status: 'COMPLETED',
            tokensUsed: Math.floor(validatedData.content.length / 4), // Rough estimate
            cost: Math.floor(validatedData.content.length / 4) * 0.00003, // Rough estimate
          }
        });
      } catch (error) {
        await prisma.aISummary.update({
          where: { id: summary.id },
          data: { status: 'FAILED' }
        });
      }
    }, 2000);

    return NextResponse.json(summary, { status: 201 });

  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Validation error', details: error.errors },
        { status: 400 }
      );
    }

    console.error('Error creating summary:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// Simulate AI summary generation
async function generateAISummary(content: string): Promise<string> {
  // This is a placeholder - in production, you'd call OpenAI, Anthropic, or another AI service
  const words = content.split(' ').length;
  const summaryLength = Math.min(Math.max(words * 0.2, 50), 500);
  
  // Simple extractive summary (first few sentences)
  const sentences = content.split(/[.!?]+/).filter(s => s.trim().length > 0);
  const summarySentences = sentences.slice(0, Math.ceil(sentences.length * 0.3));
  
  return summarySentences.join('. ').trim() + '.';
}
