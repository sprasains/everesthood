import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET() {
  const guides = await prisma.guide.findMany({
    select: {
      title: true,
      slug: true,
      shortDescription: true,
      coverImageUrl: true,
      category: true,
      author: true,
      publishedAt: true,
    },
    orderBy: { publishedAt: 'desc' },
  });
  return NextResponse.json(guides);
} 