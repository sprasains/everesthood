import { env } from '@/env.mjs';
import { getLogger } from '@/lib/logger';
import { NextRequest, NextResponse } from 'next/server';
import { RedisStats } from '@/lib/cache/types';
import { getPerformanceMetrics } from './performanceMetrics';
import { createClient } from '@supabase/supabase-js';

const logger = getLogger('monitoring');

interface MetricsData {
  serverTiming: Record<string, number>;
  redisStats: RedisStats;
  memoryUsage: NodeJS.MemoryUsage;
  requestStats: {
    path: string;
    method: string;
    duration: number;
    status: number;
    timestamp: string;
  };
}

const supabase = createClient(
  env.NEXT_PUBLIC_SUPABASE_URL,
  env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

export async function recordMetrics(
  req: NextRequest,
  res: NextResponse,
  startTime: number
): Promise<void> {
  const endTime = performance.now();
  const duration = endTime - startTime;

  const metrics: MetricsData = {
    serverTiming: {
      total: duration,
      ...getPerformanceMetrics(),
    },
    redisStats: await getRedisStats(),
    memoryUsage: process.memoryUsage(),
    requestStats: {
      path: new URL(req.url).pathname,
      method: req.method,
      duration,
      status: res.status,
      timestamp: new Date().toISOString(),
    },
  };

  // Log metrics
  logger.info({ metrics }, 'Request metrics');

  // Store in Supabase for analysis
  try {
    await supabase.from('request_metrics').insert([
      {
        path: metrics.requestStats.path,
        method: metrics.requestStats.method,
        duration: metrics.requestStats.duration,
        status: metrics.requestStats.status,
        memory_usage: metrics.memoryUsage.heapUsed,
        redis_hits: metrics.redisStats.hits,
        redis_misses: metrics.redisStats.misses,
        timestamp: metrics.requestStats.timestamp,
      },
    ]);
  } catch (error) {
    logger.error({ error }, 'Failed to store metrics');
  }

  // Set Server-Timing headers for client-side monitoring
  const serverTiming = Object.entries(metrics.serverTiming)
    .map(([name, duration]) => `${name};dur=${duration}`)
    .join(',');

  res.headers.set('Server-Timing', serverTiming);
}

async function getRedisStats(): Promise<RedisStats> {
  try {
    const stats = await redis.info('stats');
    const lines = stats.split('\n');
    const keyspaceHits = parseInt(
      lines.find((line) => line.startsWith('keyspace_hits'))?.split(':')[1] ||
        '0'
    );
    const keyspaceMisses = parseInt(
      lines.find((line) => line.startsWith('keyspace_misses'))?.split(':')[1] ||
        '0'
    );

    return {
      hits: keyspaceHits,
      misses: keyspaceMisses,
      ratio: keyspaceHits / (keyspaceHits + keyspaceMisses),
    };
  } catch (error) {
    logger.error({ error }, 'Failed to get Redis stats');
    return { hits: 0, misses: 0, ratio: 0 };
  }
}
