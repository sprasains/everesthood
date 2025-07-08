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

    // Only cache public templates for now
    const agentTemplates = (await getAgentTemplatesWithCache()).filter(t => t.isPublic);

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

    const { name, description, defaultPrompt, defaultModel, defaultTools, isPublic } = await req.json();

    if (!name || !defaultPrompt) {
      return new NextResponse('Name and defaultPrompt are required', { status: 400 });
    }

    const newAgentTemplate = await prisma.agentTemplate.create({
      data: {
        name,
        description: description || '',
        defaultPrompt,
        defaultModel: defaultModel || 'gpt-4o',
        defaultTools: defaultTools || [],
        isPublic: isPublic || false,
        version: 1,
        isLatest: true,
        // ownerId: session.user.id, // Uncomment if AgentTemplate has an ownerId
      },
    });

    return NextResponse.json(newAgentTemplate, { status: 201 });
  } catch (error) {
    console.error('Error creating agent template:', error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
}
