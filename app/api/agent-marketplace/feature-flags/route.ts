import { NextResponse } from 'next/server';
import { prisma } from '../../../../lib/prisma';

import { NextRequest } from 'next/server';

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const userId = searchParams.get('userId');
  // Fetch feature flags for user
  const flags = await prisma.featureFlag.findMany({ where: { userId } });
  return NextResponse.json(flags);
}
