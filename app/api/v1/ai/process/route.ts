import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { AgentRunStatus } from '@prisma/client';

const WORKER_API_URL = process.env.WORKER_API_URL || 'http://worker:3001';

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user || !session.user.id) {
      return new NextResponse('Unauthorized', { status: 401 });
    }
    const userId = session.user.id;
    const { agentInstanceId, input, mode } = await req.json();
    if (!agentInstanceId || !input || !mode) {
      return new NextResponse('Missing agentInstanceId, input, or mode in request body', { status: 400 });
    }
    // Optionally: Check quota, etc. here if needed
    // Forward the job to the worker service
    const response = await fetch(`${WORKER_API_URL}/api/jobs`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        agentInstanceId,
        input,
        mode,
        userId,
      }),
    });
    if (!response.ok) {
      const errorText = await response.text();
      return new NextResponse(`Worker error: ${errorText}`, { status: 500 });
    }
    const data = await response.json();
    return NextResponse.json({
      message: 'Agent job queued successfully',
      jobId: data.jobId,
    });
  } catch (error) {
    console.error('Error queuing agent job via /api/v1/ai/process:', error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
}
