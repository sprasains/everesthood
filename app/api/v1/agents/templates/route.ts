import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
// import { getAgentTemplatesWithCache } from '@/../../lib/agentTemplates';
import { prisma } from '@/lib/prisma';

export async function GET() {
  try {
    const session = await getServerSession(authOptions);

    if (!session) {
      return new NextResponse('Unauthorized', { status: 401 });
    }

    // Fetch agent templates from database
    const agentTemplates = await prisma.agentTemplate.findMany({
      where: {
        isPublic: true,
        deletedAt: null
      },
      include: {
        reviews: {
          select: {
            rating: true,
            id: true
          }
        },
        _count: {
          select: {
            agentInstances: true,
            reviews: true
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    });

    // Format templates with calculated fields
    const formattedTemplates = agentTemplates.map(template => ({
      ...template,
      reviewCount: template._count.reviews,
      instanceCount: template._count.agentInstances,
      averageRating: template.reviews.length > 0 
        ? template.reviews.reduce((sum, review) => sum + review.rating, 0) / template.reviews.length
        : 0,
      // Add fields expected by frontend
      rating: template.reviews.length > 0 
        ? template.reviews.reduce((sum, review) => sum + review.rating, 0) / template.reviews.length
        : 0,
      usageCount: template._count.agentInstances,
      complexity: 'Intermediate', // Default value
      tags: [] // Default empty array
    }));

    return NextResponse.json(formattedTemplates);
  } catch (error) {
    console.error('Error fetching agent templates:', error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || !session.user || !session.user.id) {
      return new NextResponse('Unauthorized', { status: 401 });
    }

    const {
      name,
      description,
      defaultPrompt,
      defaultModel,
      defaultTools,
      isPublic,
    } = await req.json();

    if (!name || !defaultPrompt) {
      return new NextResponse('Name and defaultPrompt are required', {
        status: 400,
      });
    }

    const newAgentTemplate = await prisma.agentTemplate.create({
      data: {
        name,
        description: description || '',
        defaultPrompt,
        defaultModel: defaultModel || 'gpt-4o',
        defaultTools: Array.isArray(defaultTools) ? defaultTools : [],
        isPublic: isPublic !== undefined ? isPublic : true,
        version: 1,
      },
    });

    return NextResponse.json(newAgentTemplate, { status: 201 });
  } catch (error) {
    // Handle unique constraint on name
    if ((error as any)?.code === 'P2002') {
      return NextResponse.json(
        { message: 'An agent template with this name already exists.' },
        { status: 409 }
      );
    }
    console.error('Error creating agent template:', error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
}
