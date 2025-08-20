// Debug endpoint for BullMQ queue stats
import { NextRequest } from 'next/server';

// Use dynamic import to ensure server-only loading
let agentJobQueue;
async function loadQueues() {
  if (!agentJobQueue) {
    const queues = await import('../../../../server/queue');
    agentJobQueue = queues.agentJobQueue;
  }
}

export async function GET(req: NextRequest) {
  await loadQueues();
  const stats = await agentJobQueue.getJobCounts();
  const failedReasons = await agentJobQueue.getFailed();
  return Response.json({
    queue: {
      name: 'agent:jobs',
      stats,
      failed: failedReasons,
    },
  });
}
