import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function GET() {
  try {
    const session = await getServerSession(authOptions);

    if (!session || !session.user || !session.user.id) {
      return new NextResponse('Unauthorized', { status: 401 });
    }

    const userId = session.user.id;

    const agentInstances = await prisma.agentInstance.findMany({
      where: {
        userId: userId,
      },
      select: {
        id: true,
        name: true,
        template: {
          select: {
            name: true,
          },
        },
      },
      orderBy: {
        name: 'asc',
      },
    });

    return NextResponse.json(agentInstances);
  } catch (error) {
    console.error('Error fetching agent instances:', error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || !session.user || !session.user.id) {
      return new NextResponse('Unauthorized', { status: 401 });
    }

    const userId = session.user.id;
    const { name, templateId, configOverride, webhookUrl, nextAgentInstanceId } = await req.json();

    if (!name || !templateId) {
      return new NextResponse('Name and template ID are required', { status: 400 });
    }

    // Check if an instance with the same name already exists for this user
    const existingInstance = await prisma.agentInstance.findFirst({
      where: {
        userId: userId,
        name: name,
      },
    });

    if (existingInstance) {
      return new NextResponse('Agent instance with this name already exists', { status: 409 });
    }

    const newAgentInstance = await prisma.agentInstance.create({
      data: {
        userId,
        templateId,
        name,
        configOverride: configOverride || {},
      },
    });

    return NextResponse.json(newAgentInstance, { status: 201 });
  } catch (error) {
    console.error('Error creating agent instance:', error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
}
