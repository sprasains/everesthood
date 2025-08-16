import { NextResponse } from 'next/server';
import prisma from '../../../../lib/prisma';

export async function GET(req) {
  const { searchParams } = new URL(req.url);
  const userId = searchParams.get('userId');
  // Fetch org/tenant info for user
  const user = await prisma.user.findUnique({ where: { id: userId }, include: { organization: true } });
  return NextResponse.json({ name: user?.organization?.name ?? 'Unknown', tenantId: user?.organization?.tenantId ?? 'Unknown' });
}
