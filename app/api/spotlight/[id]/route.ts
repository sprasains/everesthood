import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { z } from 'zod';

const updateSpotlightSchema = z.object({
  title: z.string().min(1).max(100).optional(),
  description: z.string().min(1).max(500).optional(),
  category: z.enum(['CREATOR', 'EXPERT', 'INFLUENCER', 'ENTREPRENEUR', 'EDUCATOR']).optional(),
  specialties: z.array(z.string()).optional(),
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
  })).optional(),
  isActive: z.boolean().optional(),
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

    const profileId = params.id;

    const profile = await prisma.spotlightProfile.findUnique({
      where: { 
        id: profileId,
        isActive: true
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
          orderBy: { createdAt: 'desc' }
        },
        _count: {
          select: {
            reviews: {
              where: { isVerified: true }
            }
          }
        }
      }
    });

    if (!profile) {
      return NextResponse.json({ error: 'Profile not found' }, { status: 404 });
    }

    // Increment view count
    await prisma.spotlightProfile.update({
      where: { id: profileId },
      data: { viewCount: { increment: 1 } }
    });

    return NextResponse.json(profile);

  } catch (error) {
    console.error('Error fetching spotlight profile:', error);
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

    const profileId = params.id;
    const body = await request.json();
    const validatedData = updateSpotlightSchema.parse(body);

    // Check if user owns the profile
    const existingProfile = await prisma.spotlightProfile.findUnique({
      where: { id: profileId },
      select: { userId: true }
    });

    if (!existingProfile) {
      return NextResponse.json({ error: 'Profile not found' }, { status: 404 });
    }

    if (existingProfile.userId !== session.user.id) {
      return NextResponse.json({ error: 'Not authorized to edit this profile' }, { status: 403 });
    }

    // Update profile
    const updatedProfile = await prisma.spotlightProfile.update({
      where: { id: profileId },
      data: {
        ...validatedData,
        updatedAt: new Date()
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

    return NextResponse.json(updatedProfile);

  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Validation error', details: error.errors },
        { status: 400 }
      );
    }

    console.error('Error updating spotlight profile:', error);
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

    const profileId = params.id;

    // Check if user owns the profile
    const existingProfile = await prisma.spotlightProfile.findUnique({
      where: { id: profileId },
      select: { userId: true }
    });

    if (!existingProfile) {
      return NextResponse.json({ error: 'Profile not found' }, { status: 404 });
    }

    if (existingProfile.userId !== session.user.id) {
      return NextResponse.json({ error: 'Not authorized to delete this profile' }, { status: 403 });
    }

    // Deactivate profile (soft delete)
    await prisma.spotlightProfile.update({
      where: { id: profileId },
      data: { isActive: false }
    });

    return NextResponse.json({ message: 'Profile deactivated successfully' });

  } catch (error) {
    console.error('Error deleting spotlight profile:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

