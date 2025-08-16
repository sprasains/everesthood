// app/api/agent/log/route.ts
import { NextRequest } from 'next/server';
import { saveAgentLog } from '../../../lib/agentLogs';

export async function POST(req: NextRequest) {
  const log = await req.json();
  await saveAgentLog(log); // Save to DB or external logging
  return new Response('Logged', { status: 200 });
}
