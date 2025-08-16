import { NextResponse } from 'next/server';
import prisma from '../../../../lib/prisma';

export async function GET(req) {
  const { searchParams } = new URL(req.url);
  const userId = searchParams.get('userId');
  // Fetch billing info for user
  const billing = await prisma.billingAccount.findUnique({ where: { userId } });
  return NextResponse.json({ status: billing?.status ?? 'Inactive', plan: billing?.plan ?? 'Free' });
}
