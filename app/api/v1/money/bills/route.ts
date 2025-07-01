import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
// import { requireAuth } from '@/src/middleware/auth'; // Assume this returns userId

export async function GET(req: NextRequest) {
  // const userId = await requireAuth(req);
  const userId = 'demo-user-id'; // Replace with real auth
  const bills = await prisma.bill.findMany({ where: { userId } });
  return NextResponse.json({ bills });
}

export async function POST(req: NextRequest) {
  // const userId = await requireAuth(req);
  const userId = 'demo-user-id'; // Replace with real auth
  const { name, amount, dueDate, isPaid } = await req.json();
  const bill = await prisma.bill.create({ data: { userId, name, amount, dueDate, isPaid } });
  return NextResponse.json({ bill });
}

export async function PUT(req: NextRequest) {
  // const userId = await requireAuth(req);
  const userId = 'demo-user-id'; // Replace with real auth
  const { id, name, amount, dueDate, isPaid } = await req.json();
  const bill = await prisma.bill.update({ where: { id, userId }, data: { name, amount, dueDate, isPaid } });
  return NextResponse.json({ bill });
}

export async function DELETE(req: NextRequest) {
  // const userId = await requireAuth(req);
  const userId = 'demo-user-id'; // Replace with real auth
  const { id } = await req.json();
  await prisma.bill.delete({ where: { id, userId } });
  return NextResponse.json({ success: true });
} 