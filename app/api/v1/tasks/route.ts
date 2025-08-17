import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function GET(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id)
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const tasks = await prisma.task.findMany({
    where: { ownerId: session.user.id },
    orderBy: { createdAt: 'desc' },
  });
  return NextResponse.json(tasks);
}

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id)
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const data = await req.json();
  if (!data.content)
    return NextResponse.json({ error: 'Content required' }, { status: 400 });
  const task = await prisma.task.create({
    data: {
      content: data.content,
      details: data.details || null,
      link: data.link || null,
      ownerId: session.user.id,
    },
  });
  return NextResponse.json(task);
}

export async function PUT(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id)
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const data = await req.json();
  if (!data.id)
    return NextResponse.json({ error: 'Task ID required' }, { status: 400 });
  const task = await prisma.task.update({
    where: { id: data.id, ownerId: session.user.id },
    data: {
      content: data.content,
      details: data.details,
      link: data.link,
      isCompleted: data.isCompleted,
      completedAt: data.isCompleted ? new Date() : null,
    },
  });
  return NextResponse.json(task);
}

export async function DELETE(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id)
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const { id } = await req.json();
  if (!id)
    return NextResponse.json({ error: 'Task ID required' }, { status: 400 });
  await prisma.task.delete({ where: { id, ownerId: session.user.id } });
  return NextResponse.json({ success: true });
}
