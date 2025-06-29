import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/src/lib/prisma';
// import { requireAuth } from '@/src/middleware/auth'; // Assume this returns userId

export async function GET(req: NextRequest) {
  // const userId = await requireAuth(req);
  const userId = 'demo-user-id'; // Replace with real auth
  const budgets = await prisma.budget.findMany({ where: { userId } });
  return NextResponse.json({ budgets });
}

export async function POST(req: NextRequest) {
  // const userId = await requireAuth(req);
  const userId = 'demo-user-id'; // Replace with real auth
  const { category, limitAmount } = await req.json();
  const budget = await prisma.budget.create({ data: { userId, category, limitAmount } });
  return NextResponse.json({ budget });
}

export async function PUT(req: NextRequest) {
  // const userId = await requireAuth(req);
  const userId = 'demo-user-id'; // Replace with real auth
  const { id, category, limitAmount } = await req.json();
  const budget = await prisma.budget.update({ where: { id, userId }, data: { category, limitAmount } });
  return NextResponse.json({ budget });
}

export async function DELETE(req: NextRequest) {
  // const userId = await requireAuth(req);
  const userId = 'demo-user-id'; // Replace with real auth
  const { id } = await req.json();
  await prisma.budget.delete({ where: { id, userId } });
  return NextResponse.json({ success: true });
} 