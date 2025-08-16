// Next.js 14 Route Handler for Bull Board dashboard
import { NextRequest } from 'next/server';
import { isAdmin } from '../../../lib/auth/roles';
import { agentRunQueue, agentWebhookQueue, agentCronQueue } from '../../../lib/queue';
import { createBullBoard } from 'bull-board';
import { BullMQAdapter } from 'bull-board/bullMQAdapter';

// Only allow access for admins
export async function GET(req: NextRequest) {
  const user = req.user || {};
  if (!isAdmin(user)) {
    return new Response('Forbidden', { status: 403 });
  }
  const { router } = createBullBoard([
    new BullMQAdapter(agentRunQueue),
    new BullMQAdapter(agentWebhookQueue),
    new BullMQAdapter(agentCronQueue),
  ]);
  return router.handleRequest(req);
}
