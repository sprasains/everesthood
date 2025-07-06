import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { agentJobQueue } from '@/../../lib/redis';
import bcrypt from 'bcrypt';

export async function POST(req: Request, { params }: { params: { agentInstanceId: string } }) {
  try {
    const { agentInstanceId } = params;
    const authHeader = req.headers.get('Authorization');

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return new NextResponse('Unauthorized: Missing or invalid Authorization header', { status: 401 });
    }

    const apiKey = authHeader.substring(7); // Remove 'Bearer '

    // Validate API Key and get user ID
    const apiKeys = await prisma.apiKey.findMany({
      select: {
        key: true,
        userId: true,
      },
    });

    let apiUser = null;
    for (const key of apiKeys) {
      const isValid = await bcrypt.compare(apiKey, key.key);
      if (isValid) {
        apiUser = { userId: key.userId };
        break;
      }
    }

    if (!apiUser) {
      return new NextResponse('Unauthorized: Invalid API Key', { status: 401 });
    }

    const userId = apiUser.userId;

    // Get agent input from request body
    const { input, mode } = await req.json();

    if (!input || !mode) {
      return new NextResponse('Missing input or mode in request body', { status: 400 });
    }

    // Add job to BullMQ queue
    const job = await agentJobQueue.add('run-agent', {
      agentInstanceId,
      input,
      mode,
      userId,
    });

    return NextResponse.json({
      message: 'Agent job queued successfully',
      jobId: job.id,
    });
  } catch (error) {
    console.error('Error queuing agent job via API:', error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
}
