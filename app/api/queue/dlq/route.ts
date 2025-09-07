import { NextResponse } from 'next/server';
import { dlqQueue } from '@/lib/queue/producer';

// Admin-only endpoint (caller should enforce auth/role in middleware)
export async function GET() {
  try {
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
    return NextResponse.json(
      { ok: false, error: String(err) },
      { status: 500 }
    );
  }
}
