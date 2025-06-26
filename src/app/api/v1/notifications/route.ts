import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { z } from "zod";

export async function GET(request: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const notifications = await prisma.notification.findMany({
    where: { recipientId: session.user.id },
    include: {
      actor: { select: { id: true, name: true, profilePicture: true } },
    },
    orderBy: { createdAt: 'desc' },
    take: 20,
  });

  return NextResponse.json(notifications);
}

export async function POST(request: NextRequest) {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // No body expected for mark as read, but if you add options in the future, validate here
    // Example: const markSchema = z.object({ ids: z.array(z.string()).optional() });
    // let body;
    // try {
    //   body = await request.json();
    //   markSchema.parse(body);
    // } catch (err) {
    //   return NextResponse.json({ error: "Invalid notification data", details: err instanceof z.ZodError ? err.errors : err }, { status: 400 });
    // }

    await prisma.notification.updateMany({
        where: { recipientId: session.user.id, isRead: false },
        data: { isRead: true },
    });
    
    return NextResponse.json({ message: "Notifications marked as read" });
}
