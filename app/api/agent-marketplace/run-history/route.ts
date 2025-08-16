import { NextResponse } from 'next/server';
import prisma from '../../../../lib/prisma';

export async function GET(req) {
  const { searchParams } = new URL(req.url);
  const userId = searchParams.get('userId');
  const templateId = Number(searchParams.get('templateId'));
  // Fetch run history for user and template
  const runs = await prisma.agentRun.findMany({ where: { userId, templateId }, orderBy: { startedAt: 'desc' }, take: 10 });
  return NextResponse.json(runs);
}
