import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/auth';
import prisma from '@/lib/prisma';

// Helper to get UTC start of today
function getTodayUTC() {
  const now = new Date();
  now.setUTCHours(0, 0, 0, 0);
  return now;
}

export async function GET(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const today = getTodayUTC();
  const prompts = await prisma.journalPrompt.findMany();
  if (!prompts.length) return NextResponse.json({ error: 'No prompts found' }, { status: 404 });

  // Deterministically select a prompt for the day
  const dayStr = today.toISOString().slice(0, 10);
  const hash = Array.from(dayStr).reduce((acc, c) => acc + c.charCodeAt(0), 0);
  const prompt = prompts[hash % prompts.length];

  // Get today's entry for this user and prompt
  const entry = await prisma.journalEntry.findFirst({
    where: {
      userId: session.user.id,
      promptId: prompt.id,
      createdAt: {
        gte: today,
        lt: new Date(today.getTime() + 24 * 60 * 60 * 1000),
      },
    },
  });

  return NextResponse.json({ prompt, entry });
}

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { content, promptId } = await req.json();
  if (!content || !promptId) return NextResponse.json({ error: 'Missing fields' }, { status: 400 });

  const today = getTodayUTC();
  // Check if entry exists for this user, prompt, and day
  const existing = await prisma.journalEntry.findFirst({
    where: {
      userId: session.user.id,
      promptId,
      createdAt: {
        gte: today,
        lt: new Date(today.getTime() + 24 * 60 * 60 * 1000),
      },
    },
  });

  let entry;
  if (existing) {
    entry = await prisma.journalEntry.update({
      where: { id: existing.id },
      data: { content },
    });
  } else {
    entry = await prisma.journalEntry.create({
      data: {
        userId: session.user.id,
        promptId,
        content,
      },
    });
  }

  return NextResponse.json({ entry });
} 