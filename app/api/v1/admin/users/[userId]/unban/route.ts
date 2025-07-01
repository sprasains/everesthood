import { NextRequest, NextResponse } from "next/server";
import { prisma } from '@/lib/prisma';
import { requireAdmin } from '@/middleware/adminAuth';

export async function POST(req: NextRequest, { params }: { params: { userId: string } }) {
  const adminCheck = await requireAdmin(req);
  if (adminCheck) return adminCheck;
  const { userId } = params;
  await prisma.user.update({
    where: { id: userId },
    data: { isBanned: false, banReason: null },
  });
  return NextResponse.json({ success: true });
} 