// Debug endpoint for BullMQ queue stats
import { NextRequest, NextResponse } from 'next/server';
import { agentQueue } from '../../../../lib/queue/producer';

export async function GET(req: NextRequest) {
  const stats = await agentQueue.getJobCounts();
  const failedReasons = await agentQueue.getFailed();
  return NextResponse.json({
    queue: {
      name: agentQueue.name || 'agent-run',
      stats,
      failed: failedReasons,
    },
  });
}
