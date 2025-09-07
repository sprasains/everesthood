import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { z } from 'zod';

const updatePreferencesSchema = z.object({
  categories: z.array(z.string()).optional(),
  sources: z.array(z.string()).optional(),
  tags: z.array(z.string()).optional(),
  keywords: z.array(z.string()).optional(),
});

// GET /api/news/preferences - Get user news preferences
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const preferences = await prisma.userNewsPreference.findUnique({
      where: { userId: session.user.id }
    });

    if (!preferences) {
      // Create default preferences
      const defaultPreferences = await prisma.userNewsPreference.create({
        data: {
          userId: session.user.id,
          categories: ['TECHNOLOGY', 'AI_ML', 'PROGRAMMING'],
          sources: [],
          tags: [],
          keywords: []
        }
      });
      return NextResponse.json(defaultPreferences);
    }

    return NextResponse.json(preferences);

  } catch (error) {
    console.error('Error fetching news preferences:', error);
    return NextResponse.json(
      { error: 'Failed to fetch news preferences' },
      { status: 500 }
    );
  }
}

// PUT /api/news/preferences - Update user news preferences
export async function PUT(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const validatedData = updatePreferencesSchema.parse(body);

    const preferences = await prisma.userNewsPreference.upsert({
      where: { userId: session.user.id },
      update: validatedData,
      create: {
        userId: session.user.id,
        categories: validatedData.categories || ['TECHNOLOGY', 'AI_ML', 'PROGRAMMING'],
        sources: validatedData.sources || [],
        tags: validatedData.tags || [],
        keywords: validatedData.keywords || []
      }
    });

    return NextResponse.json(preferences);

  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid input', details: error.errors },
        { status: 400 }
      );
    }

    console.error('Error updating news preferences:', error);
    return NextResponse.json(
      { error: 'Failed to update news preferences' },
      { status: 500 }
    );
  }
}
