import { NextResponse } from 'next/server';

// Admin-only endpoint (caller should enforce auth/role in middleware)
export async function GET() {
  try {
    // Skip during build time or when Redis is not available
    if (process.env.NODE_ENV === 'production' && !process.env.REDIS_URL) {
      return NextResponse.json({ ok: true, items: [] });
    }

    const { dlqQueue } = await import('@/lib/queue/producer');
    
    // Fetch failed and waiting DLQ jobs
    const failed = await dlqQueue.getJobs(
      ['failed', 'waiting', 'delayed'],
      0,
      50
    );
    const items = failed.map((j) => ({
      id: j.id,
      name: j.name,
      data: j.data,
      attemptsMade: j.attemptsMade,
      failedReason: j.failedReason,
      timestamp: j.timestamp,
    }));
    return NextResponse.json({ ok: true, items });
  } catch (err) {
    // Return empty array during build or when Redis is unavailable
    return NextResponse.json({ ok: true, items: [] });
  }
}
