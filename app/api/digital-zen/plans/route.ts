import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET() {
  const plans = await prisma.digitalDetoxPlan.findMany({
    select: {
      id: true,
      title: true,
      description: true,
      coverImage: true,
      createdAt: true,
    },
    orderBy: { createdAt: 'desc' },
  });
  return NextResponse.json(plans);
} 