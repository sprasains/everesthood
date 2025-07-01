import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function GET(request: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  const userId = session.user.id;
  const posts = await prisma.post.findMany({
    where: {
      mentionedUsers: {
        some: { id: userId },
      },
    },
    orderBy: { createdAt: 'desc' },
    include: {
      author: { select: { id: true, name: true, image: true } },
    },
  });
  return NextResponse.json(posts);
} 