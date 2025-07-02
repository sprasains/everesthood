import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { mood, notes } = await req.json();
  if (!["GREAT", "GOOD", "MEH", "BAD", "AWFUL"].includes(mood))
    return NextResponse.json({ error: "Invalid mood" }, { status: 400 });

  // Prevent duplicate for last 5 minutes
  const fiveMinutesAgo = new Date(Date.now() - 5 * 60 * 1000);
  const existing = await prisma.moodLog.findFirst({
    where: {
      userId: session.user.id,
      createdAt: { gte: fiveMinutesAgo }
    }
  });
  if (existing) return NextResponse.json({ error: "Already logged in the last 5 minutes" }, { status: 409 });

  const log = await prisma.moodLog.create({
    data: { userId: session.user.id, mood, notes }
  });
  return NextResponse.json(log, { status: 201 });
} 