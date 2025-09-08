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

    const challenge = await prisma.challenge.findUnique({
      where: { id: params.id },
      include: {
        participants: true,
      },
    });

    if (!challenge) {
      return NextResponse.json(
        { error: 'Challenge not found' },
        { status: 404 }
      );
    }

    // Check if user is already a participant
    const existingParticipant = challenge.participants.find(
      participant => participant.userId === session.user.id
    );

    if (existingParticipant) {
      return NextResponse.json(
        { error: 'You are already participating in this challenge' },
        { status: 400 }
      );
    }

    // Check if challenge is full
    if (challenge.participants.length >= challenge.maxParticipants) {
      return NextResponse.json(
        { error: 'Challenge is full' },
        { status: 400 }
      );
    }

    // Check if challenge is still accepting participants
    if (challenge.status !== 'upcoming' && challenge.status !== 'active') {
      return NextResponse.json(
        { error: 'Challenge is not accepting new participants' },
        { status: 400 }
      );
    }

    const participant = await prisma.challengeParticipant.create({
      data: {
        challengeId: params.id,
        userId: session.user.id,
        joinedAt: new Date(),
        status: 'active',
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

    return NextResponse.json({ participant }, { status: 201 });
  } catch (error) {
    console.error('Error joining challenge:', error);
    return NextResponse.json(
      { error: 'Failed to join challenge' },
      { status: 500 }
    );
  }
}
