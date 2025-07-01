import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { nanoid } from 'nanoid';

// GET user's API keys
export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) return new NextResponse("Unauthorized", { status: 401 });
  const keys = await prisma.apiKey.findMany({
    where: { userId: session.user.id },
    orderBy: { createdAt: 'desc' },
  });
  return NextResponse.json(keys);
}

// POST to create a new API key
export async function POST() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) return new NextResponse("Unauthorized", { status: 401 });
  const newKey = `evh_${nanoid(32)}`;
  const created = await prisma.apiKey.create({
    data: { key: newKey, userId: session.user.id }
  });
  return NextResponse.json({ key: created.key, id: created.id, createdAt: created.createdAt });
}
