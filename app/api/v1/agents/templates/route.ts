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

    // Bypass cache for now: query all agent templates directly from Prisma
    const agentTemplates = await prisma.agentTemplate.findMany({
      orderBy: { name: 'asc' },
    });

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

    const { name, description, defaultPrompt, defaultModel, isPublic } = await req.json();

    if (!name || !defaultPrompt) {
      return new NextResponse('Name and defaultPrompt are required', { status: 400 });
    }

    const newAgentTemplate = await prisma.agentTemplate.create({
      data: {
        name,
        description: description || '',
        defaultPrompt,
        defaultModel: defaultModel || 'gpt-4o',
        isPublic: isPublic !== undefined ? isPublic : true,
        version: 1,
      },
    });

    return NextResponse.json(newAgentTemplate, { status: 201 });
  } catch (error) {
    console.error('Error creating agent template:', error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
}
