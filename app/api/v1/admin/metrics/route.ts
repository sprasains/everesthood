import { NextRequest, NextResponse } from "next/server";
import { prisma } from '@/lib/prisma';
import { requireAdmin } from '@/middleware/adminAuth';

export async function GET(req: NextRequest) {
  const adminCheck = await requireAdmin(req);
  if (adminCheck) return adminCheck;
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const [newUsersToday, postsToday, totalUsers, totalPosts] = await Promise.all([
    prisma.user.count({ where: { createdAt: { gte: today } } }),
    prisma.post.count({ where: { createdAt: { gte: today } } }),
    prisma.user.count(),
    prisma.post.count(),
  ]);
  return NextResponse.json({ newUsersToday, postsToday, totalUsers, totalPosts });
} 