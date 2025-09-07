import { NextResponse } from 'next/server';
import { getRedis } from '../../../../lib/queue/connection';
import { agentQueue, cronQueue } from '../../../../lib/queue/producer';

export async function GET() {
  try {
    const redis = getRedis();
    const pong = await redis.ping();
    const agentCounts = await agentQueue.getJobCounts(
      'waiting',
      'active',
      'completed',
      'failed',
      'delayed'
    );
    const cronCounts = await cronQueue.getJobCounts(
      'waiting',
      'active',
      'completed',
      'failed',
      'delayed'
    );
    return NextResponse.json({ redis: pong, agentCounts, cronCounts });
  } catch (err: any) {
    return NextResponse.json(
      { ok: false, err: err?.message || String(err) },
      { status: 500 }
    );
  }
}
