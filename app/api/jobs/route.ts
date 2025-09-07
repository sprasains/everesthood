import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { z } from 'zod';

const createJobSchema = z.object({
  title: z.string().min(1).max(200),
  company: z.string().min(1).max(100),
  description: z.string().min(1).max(10000),
  requirements: z.array(z.string()).default([]),
  benefits: z.array(z.string()).default([]),
  location: z.string().min(1).max(100),
  remote: z.boolean().default(false),
  salaryMin: z.number().optional(),
  salaryMax: z.number().optional(),
  currency: z.string().default('USD'),
  type: z.enum(['full-time', 'part-time', 'contract', 'internship']),
  level: z.enum(['entry', 'mid', 'senior', 'executive']),
  category: z.string().min(1).max(50),
  tags: z.array(z.string()).default([]),
  expiresAt: z.string().datetime().optional(),
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
    const category = url.searchParams.get('category');
    const type = url.searchParams.get('type');
    const level = url.searchParams.get('level');
    const remote = url.searchParams.get('remote');
    const search = url.searchParams.get('search');
    const tags = url.searchParams.get('tags');

    const where: any = {
      isActive: true,
      OR: [
        { expiresAt: null },
        { expiresAt: { gt: new Date() } }
      ]
    };

    if (category) {
      where.category = category;
    }

    if (type) {
      where.type = type;
    }

    if (level) {
      where.level = level;
    }

    if (remote === 'true') {
      where.remote = true;
    }

    if (search) {
      where.OR = [
        { title: { contains: search, mode: 'insensitive' } },
        { company: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } },
      ];
    }

    if (tags) {
      const tagArray = tags.split(',').map(tag => tag.trim());
      where.tags = { hasSome: tagArray };
    }

    const [jobs, total] = await Promise.all([
      prisma.job.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip: (page - 1) * limit,
        take: limit,
      }),
      prisma.job.count({ where })
    ]);

    return NextResponse.json({
      jobs,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    });

  } catch (error) {
    console.error('Error fetching jobs:', error);
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
    const validatedData = createJobSchema.parse(body);

    const job = await prisma.job.create({
      data: {
        ...validatedData,
        postedBy: session.user.id,
        expiresAt: validatedData.expiresAt ? new Date(validatedData.expiresAt) : null,
      }
    });

    return NextResponse.json(job, { status: 201 });

  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Validation error', details: error.errors },
        { status: 400 }
      );
    }

    console.error('Error creating job:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
