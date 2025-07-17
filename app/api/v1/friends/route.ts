import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { NextRequest } from 'next/server';

export async function GET(req: Request) {
  const url = new URL(req.url);
  const q = url.searchParams.get('q');
  const session = await getServerSession(authOptions);
  if (!session || !session.user || !session.user.id) {
    return new NextResponse('Unauthorized', { status: 401 });
  }
  const userId = session.user.id;

  // Find all accepted friendships where the user is requester or receiver
  const friendships = await prisma.friendship.findMany({
    where: {
      status: 'ACCEPTED',
      OR: [
        { requesterId: userId },
        { receiverId: userId },
      ],
    },
  });
  const friendIds = friendships.map(f => f.requesterId === userId ? f.receiverId : f.requesterId);

  // Fetch friend user profiles
  let friends = await prisma.user.findMany({
    where: { id: { in: friendIds } },
    select: { id: true, name: true, email: true, profilePicture: true },
  });

  // If q is present, filter by name or email (case-insensitive)
  if (q) {
    const qLower = q.toLowerCase();
    friends = friends.filter(f =>
      (f.name && f.name.toLowerCase().includes(qLower)) ||
      (f.email && f.email.toLowerCase().includes(qLower))
    );
  }

  return NextResponse.json(friends);
}

// Send friend request
export async function POST(req: NextRequest) {
  const url = new URL(req.url);
  const path = url.pathname;
  const session = await getServerSession(authOptions);
  if (!session || !session.user || !session.user.id) {
    return new NextResponse('Unauthorized', { status: 401 });
  }
  const userId = session.user.id;
  const body = await req.json();

  if (path.endsWith('/request')) {
    const { receiverId } = body;
    if (!receiverId || receiverId === userId) return new NextResponse('Invalid receiverId', { status: 400 });
    // Check if friendship already exists
    const existing = await prisma.friendship.findUnique({
      where: { requesterId_receiverId: { requesterId: userId, receiverId } },
    });
    if (existing) return new NextResponse('Request already exists', { status: 400 });
    await prisma.friendship.create({
      data: { requesterId: userId, receiverId, status: 'PENDING' },
    });
    return NextResponse.json({ success: true });
  }
  if (path.endsWith('/accept')) {
    const { requesterId } = body;
    if (!requesterId) return new NextResponse('Invalid requesterId', { status: 400 });
    await prisma.friendship.update({
      where: { requesterId_receiverId: { requesterId, receiverId: userId } },
      data: { status: 'ACCEPTED' },
    });
    return NextResponse.json({ success: true });
  }
  if (path.endsWith('/decline')) {
    const { requesterId } = body;
    if (!requesterId) return new NextResponse('Invalid requesterId', { status: 400 });
    await prisma.friendship.update({
      where: { requesterId_receiverId: { requesterId, receiverId: userId } },
      data: { status: 'DECLINED' },
    });
    return NextResponse.json({ success: true });
  }
  if (path.endsWith('/remove')) {
    const { userId: otherUserId } = body;
    if (!otherUserId) return new NextResponse('Invalid userId', { status: 400 });
    // Remove friendship in either direction
    await prisma.friendship.deleteMany({
      where: {
        OR: [
          { requesterId: userId, receiverId: otherUserId },
          { requesterId: otherUserId, receiverId: userId },
        ],
      },
    });
    return NextResponse.json({ success: true });
  }
  return new NextResponse('Not found', { status: 404 });
}

// List pending friend requests for the current user
export async function GET_pending(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session || !session.user || !session.user.id) {
    return new NextResponse('Unauthorized', { status: 401 });
  }
  const userId = session.user.id;
  // Friend requests where current user is receiver and status is PENDING
  const pending = await prisma.friendship.findMany({
    where: { receiverId: userId, status: 'PENDING' },
    include: { requester: { select: { id: true, name: true, email: true, profilePicture: true } } },
  });
  return NextResponse.json(pending);
} 