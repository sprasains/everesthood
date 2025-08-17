import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import { getAgentTemplatesWithCache } from '@/../../lib/agentTemplates';
import { prisma } from '@/lib/prisma';

export async function GET() {
  try {
    const session = await getServerSession(authOptions);

    if (!session) {
      return new NextResponse('Unauthorized', { status: 401 });
    }

    // Use cache for agent templates
    const agentTemplates = await getAgentTemplatesWithCache();
    return NextResponse.json(agentTemplates);
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
