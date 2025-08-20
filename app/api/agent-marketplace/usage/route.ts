import { NextResponse } from 'next/server';
import { prisma } from '../../../../lib/prisma';

import { NextRequest } from 'next/server';

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const userId = searchParams.get('userId');
  // Fetch usage metering for user
  const usage = await prisma.usageMeter.findUnique({ where: { userId } });
  return NextResponse.json({
    count: usage?.count ?? 0,
    credits: usage?.credits ?? 0,
  });
}
