import { NextResponse } from 'next/server';
import { prisma } from '../../../../lib/prisma';

import { NextRequest } from 'next/server';

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const userId = searchParams.get('userId');
  // Fetch audit logs for user
  const logs = await prisma.auditLog.findMany({
    where: { userId },
    orderBy: { timestamp: 'desc' },
    take: 10,
  });
  return NextResponse.json(logs);
}
