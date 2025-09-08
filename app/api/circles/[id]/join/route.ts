import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const circle = await prisma.circle.findUnique({
      where: { id: params.id },
      include: {
        members: true,
      },
    });

    if (!circle) {
      return NextResponse.json(
        { error: 'Circle not found' },
        { status: 404 }
      );
    }

    // Check if user is already a member
    const existingMember = circle.members.find(
      member => member.userId === session.user.id
    );

    if (existingMember) {
      return NextResponse.json(
        { error: 'You are already a member of this circle' },
        { status: 400 }
      );
    }

    // Check if circle is full
    if (circle.members.length >= circle.maxMembers) {
      return NextResponse.json(
        { error: 'Circle is full' },
        { status: 400 }
      );
    }

    // Check if circle is private
    if (circle.isPrivate) {
      return NextResponse.json(
        { error: 'This is a private circle. You need an invitation to join.' },
        { status: 403 }
      );
    }

    const member = await prisma.circleMember.create({
      data: {
        circleId: params.id,
        userId: session.user.id,
        role: 'member',
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            image: true,
          },
        },
      },
    });

    return NextResponse.json({ member }, { status: 201 });
  } catch (error) {
    console.error('Error joining circle:', error);
    return NextResponse.json(
      { error: 'Failed to join circle' },
      { status: 500 }
    );
  }
}
