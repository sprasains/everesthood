import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/src/lib/prisma';
// import { requireAuth } from '@/src/middleware/auth'; // Assume this returns userId

export async function GET(req: NextRequest) {
  // const userId = await requireAuth(req);
  const userId = 'demo-user-id'; // Replace with real auth
  const subscriptions = await prisma.subscription.findMany({ where: { userId } });
  return NextResponse.json({ subscriptions });
}

export async function POST(req: NextRequest) {
  // const userId = await requireAuth(req);
  const userId = 'demo-user-id'; // Replace with real auth
  const { name, amount, renewalDate } = await req.json();
  const subscription = await prisma.subscription.create({ data: { userId, name, amount, renewalDate } });
  return NextResponse.json({ subscription });
}

export async function PUT(req: NextRequest) {
  // const userId = await requireAuth(req);
  const userId = 'demo-user-id'; // Replace with real auth
  const { id, name, amount, renewalDate } = await req.json();
  const subscription = await prisma.subscription.update({ where: { id, userId }, data: { name, amount, renewalDate } });
  return NextResponse.json({ subscription });
}

export async function DELETE(req: NextRequest) {
  // const userId = await requireAuth(req);
  const userId = 'demo-user-id'; // Replace with real auth
  const { id } = await req.json();
  await prisma.subscription.delete({ where: { id, userId } });
  return NextResponse.json({ success: true });
} 