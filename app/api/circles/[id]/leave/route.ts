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

    const member = await prisma.circleMember.findFirst({
      where: {
        circleId: params.id,
        userId: session.user.id,
      },
    });

    if (!member) {
      return NextResponse.json(
        { error: 'You are not a member of this circle' },
        { status: 400 }
      );
    }

    // Don't allow owner to leave
    if (member.role === 'owner') {
      return NextResponse.json(
        { error: 'Circle owner cannot leave the circle' },
        { status: 400 }
      );
    }

    await prisma.circleMember.delete({
      where: {
        id: member.id,
      },
    });

    return NextResponse.json({ message: 'Successfully left the circle' });
  } catch (error) {
    console.error('Error leaving circle:', error);
    return NextResponse.json(
      { error: 'Failed to leave circle' },
      { status: 500 }
    );
  }
}
