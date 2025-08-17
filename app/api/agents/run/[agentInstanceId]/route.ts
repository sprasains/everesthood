import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import bcrypt from 'bcrypt';
import { httpRequest } from '../../../../../src/lib/http/client';

// TODO: Replace with your actual worker service URL
const WORKER_API_URL = process.env.WORKER_API_URL || 'http://worker:3001';

export async function POST(
  req: Request,
  { params }: { params: { agentInstanceId: string } }
) {
  try {
    const { agentInstanceId } = params;
    // Remove API key validation logic
    // Optionally, you can keep this for now:
    // const authHeader = req.headers.get('Authorization');
    // if (!authHeader || !authHeader.startsWith('Bearer ')) {
    //   return new NextResponse('Unauthorized: Missing or invalid Authorization header', { status: 401 });
    // }
    // const apiKey = authHeader.substring(7);
    // ...
    // Instead, just set userId to null or a placeholder for now:
    const userId = null;

    // Get agent input from request body
    const { input, mode } = await req.json();

    if (!input || !mode) {
      return new NextResponse('Missing input or mode in request body', {
        status: 400,
      });
    }

    // Call the worker service HTTP API to enqueue the job using httpRequest
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
    console.error('Error queuing agent job via API:', error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
}
