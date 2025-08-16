import { NextResponse } from 'next/server';
import prisma from '../../../../lib/prisma';

export async function GET(req) {
  const { searchParams } = new URL(req.url);
  const userId = searchParams.get('userId');
  // Fetch feature flags for user
  const flags = await prisma.featureFlag.findMany({ where: { userId } });
  return NextResponse.json(flags);
}
