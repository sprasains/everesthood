// Debug endpoint for BullMQ queue stats
import { NextRequest } from 'next/server';
import { agentRunQueue, agentWebhookQueue, agentCronQueue } from '../../../lib/queue';

export async function GET(req: NextRequest) {
  const stats = await Promise.all([
    agentRunQueue.getJobCounts(),
    agentWebhookQueue.getJobCounts(),
    agentCronQueue.getJobCounts(),
  ]);
  const failedReasons = await Promise.all([
    agentRunQueue.getFailed(),
    agentWebhookQueue.getFailed(),
    agentCronQueue.getFailed(),
  ]);
  return Response.json({
    queues: [
      { name: 'agent:run', stats: stats[0], failed: failedReasons[0] },
      { name: 'agent:webhook', stats: stats[1], failed: failedReasons[1] },
      { name: 'agent:cron', stats: stats[2], failed: failedReasons[2] },
    ],
  });
}
