import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import prisma from '@/lib/prisma';

export async function GET() {
  try {
    const session = await getServerSession(authOptions);

    if (!session) {
      return new NextResponse('Unauthorized', { status: 401 });
    }

    // For now, return all public tools
    const tools = await prisma.tool.findMany({
      where: {
        isPublic: true,
      },
      orderBy: {
        name: 'asc',
      },
    });

    return NextResponse.json(tools);
  } catch (error) {
    console.error('Error fetching tools:', error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || !session.user || session.user.role !== 'ADMIN') { // Only admins can create tools
      return new NextResponse('Unauthorized', { status: 401 });
    }

    const { name, description, inputSchema, outputSchema, isPublic } = await req.json();

    if (!name || !description) {
      return new NextResponse('Name and description are required', { status: 400 });
    }

    const newTool = await prisma.tool.create({
      data: {
        name,
        description,
        inputSchema: inputSchema || {},
        outputSchema: outputSchema || {},
        isPublic: isPublic !== undefined ? isPublic : true,
      },
    });

    return NextResponse.json(newTool, { status: 201 });
  } catch (error) {
    console.error('Error creating tool:', error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
}
