import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { z } from 'zod';

const createSpotlightSchema = z.object({
  title: z.string().min(1).max(100),
  description: z.string().min(1).max(500),
  category: z.enum(['CREATOR', 'EXPERT', 'INFLUENCER', 'ENTREPRENEUR', 'EDUCATOR']),
  specialties: z.array(z.string()).default([]),
  socialLinks: z.object({
    linkedin: z.string().url().optional(),
    twitter: z.string().url().optional(),
    instagram: z.string().url().optional(),
    github: z.string().url().optional(),
    website: z.string().url().optional(),
  }).optional(),
  portfolio: z.array(z.object({
    title: z.string(),
    description: z.string(),
    url: z.string().url().optional(),
    image: z.string().url().optional(),
  })).default([]),
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
    const category = url.searchParams.get('category');
    const featured = url.searchParams.get('featured') === 'true';
    const verified = url.searchParams.get('verified') === 'true';
    const search = url.searchParams.get('search');

    const where: any = {
      isActive: true
    };

    if (category) {
      where.category = category;
    }

    if (featured) {
      where.featuredUntil = {
        gt: new Date()
      };
    }

    if (verified) {
      where.isVerified = true;
    }

    if (search) {
      where.OR = [
        { title: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } },
        { specialties: { hasSome: [search] } }
      ];
    }

    const [profiles, total] = await Promise.all([
      prisma.spotlightProfile.findMany({
        where,
        include: {
          user: {
            select: {
              id: true,
              name: true,
              image: true,
              email: true,
              level: true,
              xp: true
            }
          },
          reviews: {
            where: { isVerified: true },
            include: {
              reviewer: {
                select: {
                  id: true,
                  name: true,
                  image: true
                }
              }
            },
            orderBy: { createdAt: 'desc' },
            take: 3
          },
          _count: {
            select: {
              reviews: {
                where: { isVerified: true }
              }
            }
          }
        },
        orderBy: [
          { featuredUntil: 'desc' },
          { rating: 'desc' },
          { viewCount: 'desc' }
        ],
        skip: (page - 1) * limit,
        take: limit
      }),
      prisma.spotlightProfile.count({ where })
    ]);

    return NextResponse.json({
      profiles,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    });

  } catch (error) {
    console.error('Error fetching spotlight profiles:', error);
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
    const validatedData = createSpotlightSchema.parse(body);

    // Check if user already has a spotlight profile
    const existingProfile = await prisma.spotlightProfile.findUnique({
      where: { userId: session.user.id }
    });

    if (existingProfile) {
      return NextResponse.json(
        { error: 'Spotlight profile already exists' },
        { status: 400 }
      );
    }

    // Create spotlight profile
    const profile = await prisma.spotlightProfile.create({
      data: {
        userId: session.user.id,
        ...validatedData
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            image: true,
            email: true,
            level: true,
            xp: true
          }
        }
      }
    });

    return NextResponse.json(profile, { status: 201 });

  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Validation error', details: error.errors },
        { status: 400 }
      );
    }

    console.error('Error creating spotlight profile:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

