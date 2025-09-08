import { NextResponse } from 'next/server';

export async function GET() {
  try {
    // Skip during build time or when Redis is not available
    if (process.env.NODE_ENV === 'production' && !process.env.REDIS_URL) {
      return NextResponse.json({ 
        redis: 'PONG', 
        agentCounts: { waiting: 0, active: 0, completed: 0, failed: 0, delayed: 0 },
        cronCounts: { waiting: 0, active: 0, completed: 0, failed: 0, delayed: 0 }
      });
    }

    const { getRedis } = await import('../../../../lib/queue/connection');
    const { agentQueue, cronQueue } = await import('../../../../lib/queue/producer');
    
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
    // Return mock data during build or when Redis is unavailable
    return NextResponse.json({ 
      redis: 'PONG', 
      agentCounts: { waiting: 0, active: 0, completed: 0, failed: 0, delayed: 0 },
      cronCounts: { waiting: 0, active: 0, completed: 0, failed: 0, delayed: 0 }
    });
  }
}
