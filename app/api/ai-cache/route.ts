import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function GET(req: Request) {
  const prompt = new URL(req.url).searchParams.get('prompt');
  if (!prompt) return NextResponse.json({ error: 'Prompt required' }, { status: 400 });

  const cache = await prisma.aICache.findUnique({ where: { prompt } });
  if (!cache) return NextResponse.json({ error: 'No cached content' }, { status: 404 });

  return NextResponse.json({ content: cache.content, provider: cache.provider, createdAt: cache.createdAt });
} 