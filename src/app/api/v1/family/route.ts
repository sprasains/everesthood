import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/src/lib/prisma';
// import { requireAuth } from '@/src/middleware/auth'; // Assume this returns userId

export async function GET(req: NextRequest) {
  // const userId = await requireAuth(req);
  const userId = 'demo-user-id'; // Replace with real auth
  const families = await prisma.family.findMany({ where: { users: { some: { id: userId } } } });
  return NextResponse.json({ families });
}

export async function POST(req: NextRequest) {
  // const userId = await requireAuth(req);
  const userId = 'demo-user-id'; // Replace with real auth
  const { name } = await req.json();
  const family = await prisma.family.create({ data: { name, users: { connect: { id: userId } } } });
  return NextResponse.json({ family });
}

export async function PUT(req: NextRequest) {
  // const userId = await requireAuth(req);
  const userId = 'demo-user-id'; // Replace with real auth
  const { id, name } = await req.json();
  const family = await prisma.family.update({ where: { id }, data: { name } });
  return NextResponse.json({ family });
}

export async function DELETE(req: NextRequest) {
  // const userId = await requireAuth(req);
  const userId = 'demo-user-id'; // Replace with real auth
  const { id } = await req.json();
  await prisma.family.delete({ where: { id } });
  return NextResponse.json({ success: true });
} 