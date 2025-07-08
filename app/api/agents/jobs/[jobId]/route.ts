// LAYMAN: This API lets you check if your agent job is done, what the result is, or if there was a problem.
// BUSINESS: Enables clients to poll for job status and results, supporting asynchronous workflows and user feedback.
// TECHNICAL: Fetches job status, result, and error from Redis using the job ID.

import { NextResponse } from 'next/server';
// import { redis } from '@/../../lib/redis';

// TODO: Replace with your actual worker service URL
const WORKER_API_URL = process.env.WORKER_API_URL || 'http://worker:3001';

export async function GET(_req: Request, { params }: { params: { jobId: string } }) {
  const { jobId } = params;
  // Call the worker service HTTP API to get job status/result
  const response = await fetch(`${WORKER_API_URL}/api/jobs/${jobId}`);
  if (!response.ok) {
    const errorText = await response.text();
    return new NextResponse(`Worker error: ${errorText}`, { status: 500 });
  }
  const data = await response.json();
  return NextResponse.json(data);
} 