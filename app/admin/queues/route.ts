// Next.js 14 Route Handler for Bull Board dashboard (refactored for @bull-board/api)
import { NextRequest } from 'next/server';
import { isAdmin } from '../../../lib/auth/roles';

// Use dynamic import to ensure server-only loading
import type { Queue } from 'bullmq';
let agentJobQueue: Queue | undefined;
async function loadQueues() {
  if (!agentJobQueue) {
    const queues = await import('../../../server/queue');
    agentJobQueue = queues.agentJobQueue;
  }
}

// Bull Board v6+ API
import { createBullBoard } from '@bull-board/api';
import { BullMQAdapter } from '@bull-board/api/bullMQAdapter';
import { ExpressAdapter } from '@bull-board/express';

const serverAdapter = new ExpressAdapter();
serverAdapter.setBasePath('/admin/queues');

export async function GET(req: NextRequest) {
  // TODO: Replace with actual user extraction logic
  const user = (req as any).user || {};
  if (!isAdmin(user)) {
    return new Response('Forbidden', { status: 403 });
  }
  await loadQueues();
  if (!agentJobQueue) {
    return new Response('Queue not initialized', { status: 500 });
  }
  createBullBoard({
    queues: [new BullMQAdapter(agentJobQueue)],
    serverAdapter,
  });

  // ExpressAdapter exposes a router, but Next.js expects a Response
  // You may need to proxy requests or use a custom handler here
  // For now, return a placeholder
  return new Response(
    'Bull Board UI is available at /admin/queues (ExpressAdapter integration required)',
    { status: 200 }
  );
}
