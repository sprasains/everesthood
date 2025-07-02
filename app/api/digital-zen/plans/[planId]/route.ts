import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(_req, { params }: { params: { planId: string } }) {
  const plan = await prisma.digitalDetoxPlan.findUnique({
    where: { id: params.planId },
    include: {
      tasks: { orderBy: [{ day: 'asc' }, { order: 'asc' }] },
    },
  });
  if (!plan) {
    return NextResponse.json({ error: 'Plan not found' }, { status: 404 });
  }
  return NextResponse.json(plan);
} 