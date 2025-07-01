import { NextRequest, NextResponse } from "next/server";
import { prisma } from '@/lib/prisma';
import { requireAdmin } from '@/middleware/adminAuth';

export async function GET(req: NextRequest) {
  const adminCheck = await requireAdmin(req);
  if (adminCheck) return adminCheck;
  const users = await prisma.user.findMany({
    select: {
      id: true,
      name: true,
      email: true,
      role: true,
      isBanned: true,
      languagePreference: true,
      createdAt: true,
    },
    orderBy: { createdAt: "desc" },
  });
  return NextResponse.json({ users });
} 