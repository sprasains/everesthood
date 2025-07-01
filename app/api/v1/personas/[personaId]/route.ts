import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

// Helper to verify ownership
async function verifyOwnership(userId: string, personaId: string) {
  const persona = await prisma.customPersona.findUnique({ where: { id: personaId } });
  return persona?.ownerId === userId;
}

// PUT (Update) a persona
export async function PUT(req: NextRequest, { params }: { params: { personaId: string } }) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) return new NextResponse("Unauthorized", { status: 401 });

  if (!await verifyOwnership(session.user.id, params.personaId)) {
    return new NextResponse("Forbidden", { status: 403 });
  }

  const { name, prompt, icon } = await req.json();
  const updatedPersona = await prisma.customPersona.update({
    where: { id: params.personaId },
    data: { name, prompt, icon },
  });
  return NextResponse.json(updatedPersona);
}

// DELETE a persona
export async function DELETE(req: NextRequest, { params }: { params: { personaId: string } }) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) return new NextResponse("Unauthorized", { status: 401 });

  if (!await verifyOwnership(session.user.id, params.personaId)) {
    return new NextResponse("Forbidden", { status: 403 });
  }

  await prisma.customPersona.delete({ where: { id: params.personaId } });
  return new NextResponse(null, { status: 204 });
}
