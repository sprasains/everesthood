// Debug endpoint for BullMQ queue stats
import { NextRequest, NextResponse } from 'next/server';

export async function GET(req: NextRequest) {
  try {
    // Skip during build time or when Redis is not available
    if (process.env.NODE_ENV === 'production' && !process.env.REDIS_URL) {
      return NextResponse.json({
        queue: {
          name: 'agent-run',
          stats: { waiting: 0, active: 0, completed: 0, failed: 0, delayed: 0 },
          failed: [],
        },
      });
    }

    const { agentQueue } = await import('../../../../lib/queue/producer');
    
    const stats = await agentQueue.getJobCounts();
    const failedReasons = await agentQueue.getFailed();
    return NextResponse.json({
      queue: {
        name: agentQueue.name || 'agent-run',
        stats,
        failed: failedReasons,
      },
    });
  } catch (err) {
    // Return mock data during build or when Redis is unavailable
    return NextResponse.json({
      queue: {
        name: 'agent-run',
        stats: { waiting: 0, active: 0, completed: 0, failed: 0, delayed: 0 },
        failed: [],
      },
    });
  }
}
