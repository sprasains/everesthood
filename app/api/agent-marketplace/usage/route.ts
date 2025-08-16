import { NextResponse } from 'next/server';
import prisma from '../../../../lib/prisma';

export async function GET(req) {
  const { searchParams } = new URL(req.url);
  const userId = searchParams.get('userId');
  // Fetch usage metering for user
  const usage = await prisma.usageMeter.findUnique({ where: { userId } });
  return NextResponse.json({ count: usage?.count ?? 0, credits: usage?.credits ?? 0 });
}
