import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { httpRequest } from '../../../../../src/lib/http/client';

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
      return new NextResponse(
        'Missing agentInstanceId, input, or mode in request body',
        { status: 400 }
      );
    }
    // Optionally: Check quota, etc. here if needed
    // Forward the job to the worker service using httpRequest
    try {
      const data = await httpRequest({
        url: `${WORKER_API_URL}/api/jobs`,
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        data: { agentInstanceId, input, mode, userId },
        timeoutMs: 10000,
        retries: 2,
      });
      return NextResponse.json({
        message: 'Agent job queued successfully',
        jobId: data.jobId,
      });
    } catch (err: any) {
      return new NextResponse(
        `Worker error: ${err?.message || 'Unknown error'}`,
        { status: 500 }
      );
    }
  } catch (error) {
    console.error('Error queuing agent job via /api/v1/ai/process:', error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
}
