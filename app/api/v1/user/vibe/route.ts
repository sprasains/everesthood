import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

// Get current user's vibe
export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id)
    return new NextResponse('Unauthorized', { status: 401 });

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: {
      currentVibe: {
        select: {
          id: true,
          name: true,
          emoji: true,
          createdAt: true,
        },
      },
    },
  });

  if (!user) return new NextResponse('User not found', { status: 404 });
  return NextResponse.json(user.currentVibe || null);
}

// Update user's vibe
export async function PUT(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id)
      return new NextResponse('Unauthorized', { status: 401 });

    const { name, emoji } = await req.json();
    if (!name || !emoji)
      return NextResponse.json(
        { error: 'Name and emoji required' },
        { status: 400 }
      );

    // Create new vibe and update user
    const vibe = await prisma.userVibe.create({
      data: {
        name,
        emoji,
        userId: session.user.id,
      },
    });

    await prisma.user.update({
      where: { id: session.user.id },
      data: { currentVibeId: vibe.id },
    });

    return NextResponse.json(vibe);
  } catch (error) {
    console.error('Error updating user vibe:', error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
}
