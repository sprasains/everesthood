import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import prisma from '@/lib/prisma';

export async function GET(req: Request, { params }: { params: { id: string } }) {
  try {
    const session = await getServerSession(authOptions);

    if (!session) {
      return new NextResponse('Unauthorized', { status: 401 });
    }

    const { id } = params;

    const agentTemplate = await prisma.agentTemplate.findUnique({
      where: {
        id: id,
      },
    });

    if (!agentTemplate) {
      return new NextResponse('Agent template not found', { status: 404 });
    }

    // Only allow access to public templates or templates owned by the user (if ownerId is implemented)
    // if (!agentTemplate.isPublic && agentTemplate.ownerId !== session.user.id) {
    //   return new NextResponse('Forbidden', { status: 403 });
    // }

    return NextResponse.json(agentTemplate);
  } catch (error) {
    console.error('Error fetching agent template:', error);
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
    const { name, description, defaultPrompt, defaultModel, defaultTools, isPublic, createNewVersion } = await req.json();

    // Ensure the user has permission to edit this template (e.g., is admin or owner)
    const existingTemplate = await prisma.agentTemplate.findUnique({
      where: {
        id: id,
      },
    });

    if (!existingTemplate) {
      return new NextResponse('Agent template not found', { status: 404 });
    }

    // if (session.user.role !== 'ADMIN' && existingTemplate.ownerId !== session.user.id) {
    //   return new NextResponse('Forbidden', { status: 403 });
    // }

    if (createNewVersion) {
      // Mark the old version as not latest
      await prisma.agentTemplate.update({
        where: { id: existingTemplate.id },
        data: { isLatest: false },
      });

      // Create a new version
      const newVersion = await prisma.agentTemplate.create({
        data: {
          name: name || existingTemplate.name,
          description: description || existingTemplate.description,
          defaultPrompt: defaultPrompt || existingTemplate.defaultPrompt,
          defaultModel: defaultModel || existingTemplate.defaultModel,
          defaultTools: defaultTools || existingTemplate.defaultTools,
          isPublic: isPublic !== undefined ? isPublic : existingTemplate.isPublic,
          version: existingTemplate.version + 1,
          isLatest: true,
          // ownerId: existingTemplate.ownerId, // Preserve owner
        },
      });
      return NextResponse.json(newVersion);
    } else {
      // Update existing version
      const updatedTemplate = await prisma.agentTemplate.update({
        where: {
          id: id,
        },
        data: {
          name: name || existingTemplate.name,
          description: description || existingTemplate.description,
          defaultPrompt: defaultPrompt || existingTemplate.defaultPrompt,
          defaultModel: defaultModel || existingTemplate.defaultModel,
          defaultTools: defaultTools || existingTemplate.defaultTools,
          isPublic: isPublic !== undefined ? isPublic : existingTemplate.isPublic,
        },
      });
      return NextResponse.json(updatedTemplate);
    }
  } catch (error) {
    console.error('Error updating agent template:', error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
}

export async function DELETE(req: Request, { params }: { params: { id: string } }) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || !session.user || session.user.role !== 'ADMIN') { // Only admins can delete templates
      return new NextResponse('Unauthorized', { status: 401 });
    }

    const { id } = params;

    // Ensure the template exists before deleting
    const existingTemplate = await prisma.agentTemplate.findUnique({
      where: {
        id: id,
      },
    });

    if (!existingTemplate) {
      return new NextResponse('Agent template not found', { status: 404 });
    }

    await prisma.agentTemplate.delete({
      where: {
        id: id,
      },
    });

    return new NextResponse(null, { status: 204 });
  } catch (error) {
    console.error('Error deleting agent template:', error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
}
