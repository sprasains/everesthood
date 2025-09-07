import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { z } from 'zod';

const sharePersonaSchema = z.object({
  sharedWith: z.string().min(1), // User ID or "public"
  permissions: z.string().min(1), // JSON string containing permissions
});

// POST /api/personas/[id]/share - Share persona
export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const validatedData = sharePersonaSchema.parse(body);

    // Check if persona exists and user owns it
    const persona = await prisma.persona.findUnique({
      where: { id: params.id }
    });

    if (!persona) {
      return NextResponse.json({ error: 'Persona not found' }, { status: 404 });
    }

    if (persona.userId !== session.user.id) {
      return NextResponse.json({ error: 'Access denied' }, { status: 403 });
    }

    // Check if already shared with this user/public
    const existingShare = await prisma.personaShare.findFirst({
      where: {
        personaId: params.id,
        sharedWith: validatedData.sharedWith
      }
    });

    if (existingShare) {
      return NextResponse.json(
        { error: 'Persona is already shared with this user' },
        { status: 400 }
      );
    }

    const share = await prisma.personaShare.create({
      data: {
        personaId: params.id,
        userId: session.user.id,
        sharedWith: validatedData.sharedWith,
        permissions: validatedData.permissions
      }
    });

    // Update persona visibility if sharing publicly
    if (validatedData.sharedWith === 'public') {
      await prisma.persona.update({
        where: { id: params.id },
        data: { visibility: 'SHARED' }
      });
    }

    return NextResponse.json(share, { status: 201 });

  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid input', details: error.errors },
        { status: 400 }
      );
    }

    console.error('Error sharing persona:', error);
    return NextResponse.json(
      { error: 'Failed to share persona' },
      { status: 500 }
    );
  }
}
