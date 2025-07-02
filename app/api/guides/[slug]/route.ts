import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import type { NextRequest } from 'next/server';

export async function GET(req: NextRequest, { params }: { params: { slug: string } }) {
  const { slug } = params;
  const guide = await prisma.guide.findUnique({
    where: { slug },
    select: {
      id: true,
      title: true,
      slug: true,
      shortDescription: true,
      coverImageUrl: true,
      category: true,
      content: true,
      author: true,
      publishedAt: true,
    },
  });
  if (!guide) {
    return NextResponse.json({ error: 'Guide not found' }, { status: 404 });
  }
  return NextResponse.json(guide);
} 