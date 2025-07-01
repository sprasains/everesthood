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

  let notifications = await prisma.notification.findMany({
    where: { recipientId: session.user.id },
    include: {
      actor: { select: { id: true, name: true, profilePicture: true } },
    },
    orderBy: { createdAt: 'desc' },
    take: 20,
  });

  // Attach post/news title for NEW_POST and NEWS
  notifications = await Promise.all(notifications.map(async (n) => {
    if (n.type === 'NEW_POST' && n.entityId) {
      const post = await prisma.post.findUnique({ where: { id: n.entityId } });
      return { ...n, title: post?.title || '' };
    }
    if (n.type === 'NEWS' && n.entityId) {
      const news = await prisma.newsArticle.findUnique({ where: { id: n.entityId } });
      return {
        ...n,
        title: news?.title || '',
        actor: n.actor && typeof n.actor === 'object' ? n.actor : { id: '', name: null, profilePicture: null },
      };
    }
    return {
      ...n,
      actor: n.actor && typeof n.actor === 'object' ? n.actor : { id: '', name: null, profilePicture: null },
    };
  }));

  return NextResponse.json(notifications);
}

export async function POST(request: NextRequest) {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // If admin/system notification
    const body = await request.json().catch(() => null);
    if (body && body.type === 'SYSTEM' && body.message) {
      // Only allow admin (add your admin check here)
      if (session.user.email !== process.env.ADMIN_EMAIL) {
        return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
      }
      const users = await prisma.user.findMany({ select: { id: true } });
      for (const user of users) {
        await prisma.notification.create({
          data: {
            recipientId: user.id,
            actorId: session.user.id,
            type: 'SYSTEM',
            entityId: null,
          },
        });
        try {
          // @ts-ignore
          if (globalThis.io) {
            // if (globalThis.io && typeof globalThis.io.to === 'function') {
            //   globalThis.io.to(user.id).emit('notification', {
            //     type: 'SYSTEM',
            //     message: body.message,
            //     actorId: session.user.id,
            //   });
            // }
          }
        } catch (e) { /* ignore */ }
      }
      return NextResponse.json({ message: 'System notification sent.' });
    }

    // Mark all as read (default behavior)
    await prisma.notification.updateMany({
        where: { recipientId: session.user.id, isRead: false },
        data: { isRead: true },
    });
    
    return NextResponse.json({ message: "Notifications marked as read" });
}
