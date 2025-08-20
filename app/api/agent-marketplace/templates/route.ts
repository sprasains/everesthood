// app/api/agent-marketplace/templates/route.ts
import { NextResponse } from 'next/server';
import { prisma } from '../../../../lib/prisma';

export async function GET() {
  // Fetch agent templates from Prisma
  const templates = await prisma.agentTemplate.findMany({
    include: {
      steps: true,
      credentials: true,
      health: true,
      jobQueue: true,
    },
  });
  return NextResponse.json(templates);
}
