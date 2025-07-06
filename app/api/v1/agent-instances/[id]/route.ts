import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import prisma from '@/lib/prisma';

export async function GET(req: Request, { params }: { params: { id: string } }) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || !session.user || !session.user.id) {
      return new NextResponse('Unauthorized', { status: 401 });
    }

    const { id } = params;
    const userId = session.user.id;

    const agentInstance = await prisma.agentInstance.findUnique({
      where: {
        id: id,
        userId: userId, // Ensure user owns the instance
      },
      include: {
        template: true, // Include template details
      },
    });

    if (!agentInstance) {
      return new NextResponse('Agent instance not found or unauthorized', { status: 404 });
    }

    return NextResponse.json(agentInstance);
  } catch (error) {
    console.error('Error fetching agent instance:', error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
}

export async function PUT(req: Request, { params }: { params: { id: string } }) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || !session.user || !session.user.id) {
      return new NextResponse('Unauthorized', { status: 401 });
    }

    const { id } = params;
    const userId = session.user.id;
    const { name, configOverride, webhookUrl } = await req.json();

    // Ensure the user owns the agent instance before updating
    const existingInstance = await prisma.agentInstance.findUnique({
      where: {
        id: id,
        userId: userId,
      },
    });

    if (!existingInstance) {
      return new NextResponse('Agent instance not found or unauthorized', { status: 404 });
    }

    const updatedAgentInstance = await prisma.agentInstance.update({
      where: {
        id: id,
      },
      data: {
        name: name || existingInstance.name,
        configOverride: configOverride !== undefined ? configOverride : existingInstance.configOverride,
        webhookUrl: webhookUrl !== undefined ? webhookUrl : existingInstance.webhookUrl, // Allow updating webhook URL
      },
    });

    // Create a new AgentConfigRevision
    await prisma.agentConfigRevision.create({
      data: {
        agentInstanceId: updatedAgentInstance.id,
        configSnapshot: updatedAgentInstance.configOverride || {},
        revisionNumber: (await prisma.agentConfigRevision.count({
          where: { agentInstanceId: updatedAgentInstance.id },
        })) + 1,
      },
    });

    return NextResponse.json(updatedAgentInstance);
  } catch (error) {
    console.error('Error updating agent instance:', error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
}

export async function DELETE(req: Request, { params }: { params: { id: string } }) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || !session.user || !session.user.id) {
      return new NextResponse('Unauthorized', { status: 401 });
    }

    const { id } = params;
    const userId = session.user.id;

    // Ensure the user owns the agent instance before deleting
    const existingInstance = await prisma.agentInstance.findUnique({
      where: {
        id: id,
        userId: userId,
      },
    });

    if (!existingInstance) {
      return new NextResponse('Agent instance not found or unauthorized', { status: 404 });
    }

    await prisma.agentInstance.delete({
      where: {
        id: id,
      },
    });

    return new NextResponse(null, { status: 204 });
  } catch (error) {
    console.error('Error deleting agent instance:', error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
}
