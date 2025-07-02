import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { z } from "zod";

export async function GET(request: NextRequest, { params }: { params: { postId: string } }) {
  const post = await prisma.post.findUnique({
    where: { id: params.postId, isDeleted: false },
    select: {
      id: true,
      content: true,
      authorId: true,
      createdAt: true,
      title: true,
      type: true,
      mediaUrls: true,
      metadata: true,
      viewCount: true,
      isDeleted: true,
      newsArticleId: true,
      commentsJson: true,
      author: { select: { id: true, name: true, profilePicture: true } },
    },
  });
  if (!post) return NextResponse.json({ error: "Not found" }, { status: 404 });
  await prisma.post.update({ where: { id: params.postId }, data: { viewCount: { increment: 1 } } });
  return NextResponse.json(post);
}

export async function PUT(request: NextRequest, { params }: { params: { postId: string } }) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const post = await prisma.post.findUnique({ where: { id: params.postId } });
  if (!post) return NextResponse.json({ error: "Not found" }, { status: 404 });
  if (post.authorId !== session.user.id) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }
  const updatePostSchema = z.object({
    title: z.string().max(200).optional(),
    content: z.any(),
    type: z.string().optional(),
    metadata: z.any().optional(),
    mediaUrls: z.array(z.string()).optional(),
  });
  let body;
  try {
    body = await request.json();
    updatePostSchema.parse(body);
  } catch (err) {
    return NextResponse.json({ error: "Invalid post data", details: err instanceof z.ZodError ? err.errors : err }, { status: 400 });
  }
  const { title, content, type, metadata, mediaUrls } = body;
  const updated = await prisma.post.update({
    where: { id: params.postId },
    data: { title, content, type, metadata, mediaUrls },
  });
  return NextResponse.json({ post: updated });
}

export async function DELETE(request: NextRequest, { params }: { params: { postId: string } }) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const post = await prisma.post.findUnique({ where: { id: params.postId } });
  if (!post) return NextResponse.json({ error: "Not found" }, { status: 404 });
  if (post.authorId !== session.user.id) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }
  await prisma.post.update({ where: { id: params.postId }, data: { isDeleted: true } });
  return NextResponse.json({ success: true });
} 