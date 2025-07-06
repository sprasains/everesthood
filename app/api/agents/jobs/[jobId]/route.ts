// LAYMAN: This API lets you check if your agent job is done, what the result is, or if there was a problem.
// BUSINESS: Enables clients to poll for job status and results, supporting asynchronous workflows and user feedback.
// TECHNICAL: Fetches job status, result, and error from Redis using the job ID.

import { NextResponse } from 'next/server';
import { redis } from '@/../../lib/redis';

export async function GET(_req: Request, { params }: { params: { jobId: string } }) {
  const { jobId } = params;
  // LAYMAN: Look up the job's status and result in Redis.
  // BUSINESS: Allows the frontend or other services to track job progress and display results/errors to users.
  // TECHNICAL: Uses Redis keys to fetch status, result, and error for the given job ID.
  const status = await redis.get(`agent-job:${jobId}:status`);
  const result = await redis.get(`agent-job:${jobId}:result`);
  const error = await redis.get(`agent-job:${jobId}:error`);
  return NextResponse.json({
    jobId,
    status,
    result: result ? JSON.parse(result) : null,
    error,
  });
} 