import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
// import { requireAuth } from '@/src/middleware/auth'; // Assume this returns userId and familyId

export async function GET(req: NextRequest) {
  // const { userId, familyId } = await requireAuth(req);
  const familyId = 'demo-family-id'; // Replace with real auth
  const events = await prisma.event.findMany({ where: { familyId }, include: { attendees: true } });
  return NextResponse.json({ events });
}

export async function POST(req: NextRequest) {
  // const { userId, familyId } = await requireAuth(req);
  const userId = 'demo-user-id';
  const familyId = 'demo-family-id';
  const { title, description, startTime, endTime, attendeeIds } = await req.json();
  const event = await prisma.event.create({
    data: {
      familyId,
      createdById: userId,
      title,
      description,
      startTime,
      endTime,
      attendees: { create: attendeeIds.map((id: string) => ({ userId: id })) },
    },
    include: { attendees: true },
  });
  return NextResponse.json({ event });
}

export async function PUT(req: NextRequest) {
  // const { userId, familyId } = await requireAuth(req);
  const userId = 'demo-user-id';
  const familyId = 'demo-family-id';
  const { id, title, description, startTime, endTime, attendeeIds } = await req.json();
  const event = await prisma.event.update({
    where: { id, familyId },
    data: {
      title,
      description,
      startTime,
      endTime,
      attendees: {
        deleteMany: {},
        create: attendeeIds.map((id: string) => ({ userId: id })),
      },
    },
    include: { attendees: true },
  });
  return NextResponse.json({ event });
}

export async function DELETE(req: NextRequest) {
  // const { userId, familyId } = await requireAuth(req);
  const familyId = 'demo-family-id';
  const { id } = await req.json();
  await prisma.event.delete({ where: { id, familyId } });
  return NextResponse.json({ success: true });
} 