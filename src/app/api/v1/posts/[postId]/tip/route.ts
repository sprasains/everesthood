import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function POST(req: NextRequest, { params }: { params: { postId: string } }) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) return new NextResponse("Unauthorized", { status: 401 });
  const { postId } = params;
  const { amount } = await req.json(); // amount of credits to tip

  // 1. Get post and author
  const post = await prisma.post.findUnique({
    where: { id: postId },
    include: { author: true },
  });
  if (!post || !post.author) return new NextResponse("Post or author not found", { status: 404 });
  if (post.author.id === session.user.id) return new NextResponse("Cannot tip yourself", { status: 400 });

  // 2. Check tipper's balance
  const tipper = await prisma.user.findUnique({ where: { id: session.user.id } });
  if (!tipper || tipper.tippingBalance < amount) return new NextResponse("Insufficient balance", { status: 400 });

  // 3. Transaction: decrement tipper, increment creator
  await prisma.$transaction([
    prisma.user.update({
      where: { id: tipper.id },
      data: { tippingBalance: { decrement: amount } },
    }),
    prisma.user.update({
      where: { id: post.author.id },
      data: { creatorBalance: { increment: amount } },
    }),
    prisma.userActivity.create({
      data: {
        userId: tipper.id,
        action: 'tip',
        entityType: 'post',
        entityId: postId,
        metadata: { amount, creatorId: post.author.id },
      },
    }),
  ]);

  return NextResponse.json({ success: true });
}
