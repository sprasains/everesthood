import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function GET() {
  try {
    const digest = await prisma.dailyDigest.findUnique({
      where: { id: 1 },
    });
    if (!digest) {
      return NextResponse.json({ error: 'Daily digest not found.' }, { status: 404 });
    }
    return NextResponse.json(digest);
  } catch (error) {
    console.error('Failed to fetch daily digest:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
} 