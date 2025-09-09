import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { getRedis } from '@/lib/queue/connection';
import os from 'os';

export const dynamic = 'force-dynamic';

interface PerformanceMetrics {
  timestamp: string;
  memory: {
    used: number;
    total: number;
    external: number;
    rss: number;
    heapUsed: number;
    heapTotal: number;
    heapLimit: number;
  };
  cpu: {
    usage: NodeJS.CpuUsage;
    loadAverage: number[];
    uptime: number;
  };
  system: {
    platform: string;
    arch: string;
    nodeVersion: string;
    pid: number;
    uptime: number;
    totalMemory: number;
    freeMemory: number;
  };
  database: {
    connectionCount: number;
    queryTime: number;
    lastQueryTime: string;
  };
  redis: {
    connected: boolean;
    memory: any;
    info: any;
  };
  requests: {
    total: number;
    errors: number;
    averageResponseTime: number;
    requestsPerSecond: number;
    lastError?: string;
    lastErrorTime?: string;
  };
  queue: {
    waiting: number;
    active: number;
    completed: number;
    failed: number;
    delayed: number;
  };
}

// Global metrics tracking
declare global {
  var requestCount: number;
  var errorCount: number;
  var totalResponseTime: number;
  var lastError: string;
  var lastErrorTime: string;
  var startTime: number;
}

// Initialize global metrics if not already set
if (typeof global.requestCount === 'undefined') {
  global.requestCount = 0;
  global.errorCount = 0;
  global.totalResponseTime = 0;
  global.lastError = '';
  global.lastErrorTime = '';
  global.startTime = Date.now();
}

export async function GET(req: NextRequest) {
  const session = await getServerSession(authOptions);
  
  if (!session || session.user.role !== 'ADMIN') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
  }

  try {
    const performance: PerformanceMetrics = {
      timestamp: new Date().toISOString(),
      memory: await getMemoryMetrics(),
      cpu: await getCpuMetrics(),
      system: await getSystemMetrics(),
      database: await getDatabaseMetrics(),
      redis: await getRedisMetrics(),
      requests: await getRequestMetrics(),
      queue: await getQueueMetrics()
    };

    return NextResponse.json(performance);
  } catch (error) {
    return NextResponse.json({
      error: error.message,
      timestamp: new Date().toISOString()
    }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  
  if (!session || session.user.role !== 'ADMIN') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
  }

  const body = await req.json();
  const { action } = body;
  
  try {
    switch (action) {
      case 'reset':
        global.requestCount = 0;
        global.errorCount = 0;
        global.totalResponseTime = 0;
        global.lastError = '';
        global.lastErrorTime = '';
        global.startTime = Date.now();
        
        return NextResponse.json({
          success: true,
          message: 'Performance metrics reset',
          timestamp: new Date().toISOString()
        });
      
      case 'gc':
        // Force garbage collection if available
        if (global.gc) {
          global.gc();
          return NextResponse.json({
            success: true,
            message: 'Garbage collection triggered',
            timestamp: new Date().toISOString()
          });
        } else {
          return NextResponse.json({
            success: false,
            message: 'Garbage collection not available (run with --expose-gc)',
            timestamp: new Date().toISOString()
          });
        }
      
      default:
        return NextResponse.json({
          error: 'Invalid action'
        }, { status: 400 });
    }
  } catch (error) {
    return NextResponse.json({
      error: error.message,
      action,
      timestamp: new Date().toISOString()
    }, { status: 500 });
  }
}

async function getMemoryMetrics() {
  const memUsage = process.memoryUsage();
  const systemMem = {
    total: os.totalmem(),
    free: os.freemem()
  };
  
  return {
    used: memUsage.heapUsed,
    total: memUsage.heapTotal,
    external: memUsage.external,
    rss: memUsage.rss,
    heapUsed: memUsage.heapUsed,
    heapTotal: memUsage.heapTotal,
    heapLimit: memUsage.heapTotal * 2, // Approximate limit
    systemTotal: systemMem.total,
    systemFree: systemMem.free,
    systemUsed: systemMem.total - systemMem.free
  };
}

async function getCpuMetrics() {
  const cpuUsage = process.cpuUsage();
  const loadAvg = os.loadavg();
  
  return {
    usage: cpuUsage,
    loadAverage: loadAvg,
    uptime: process.uptime(),
    cpus: os.cpus().length
  };
}

async function getSystemMetrics() {
  return {
    platform: process.platform,
    arch: process.arch,
    nodeVersion: process.version,
    pid: process.pid,
    uptime: process.uptime(),
    totalMemory: os.totalmem(),
    freeMemory: os.freemem(),
    hostname: os.hostname(),
    type: os.type(),
    release: os.release()
  };
}

async function getDatabaseMetrics() {
  try {
    const startTime = Date.now();
    await prisma.$queryRaw`SELECT 1`;
    const queryTime = Date.now() - startTime;
    
    // Get connection pool info
    const poolInfo = await prisma.$queryRaw`
      SELECT 
        count(*) as total_connections,
        count(*) FILTER (WHERE state = 'active') as active_connections,
        count(*) FILTER (WHERE state = 'idle') as idle_connections
      FROM pg_stat_activity 
      WHERE datname = current_database()
    `;
    
    return {
      connectionCount: Array.isArray(poolInfo) ? poolInfo[0]?.total_connections || 0 : 0,
      queryTime,
      lastQueryTime: new Date().toISOString(),
      poolInfo
    };
  } catch (error) {
    return {
      connectionCount: 0,
      queryTime: -1,
      lastQueryTime: new Date().toISOString(),
      error: error.message
    };
  }
}

async function getRedisMetrics() {
  try {
    const redis = getRedis();
    if (!redis) {
      return {
        connected: false,
        error: 'Redis not configured'
      };
    }
    
    const info = await redis.info('memory');
    const memoryInfo = info.split('\r\n').reduce((acc, line) => {
      const [key, value] = line.split(':');
      if (key && value) {
        acc[key] = value;
      }
      return acc;
    }, {} as Record<string, string>);
    
    return {
      connected: true,
      memory: memoryInfo,
      info: {
        used_memory: memoryInfo.used_memory,
        used_memory_human: memoryInfo.used_memory_human,
        used_memory_peak: memoryInfo.used_memory_peak,
        used_memory_peak_human: memoryInfo.used_memory_peak_human
      }
    };
  } catch (error) {
    return {
      connected: false,
      error: error.message
    };
  }
}

async function getRequestMetrics() {
  const uptime = (Date.now() - global.startTime) / 1000; // seconds
  const requestsPerSecond = global.requestCount / uptime;
  const averageResponseTime = global.requestCount > 0 
    ? global.totalResponseTime / global.requestCount 
    : 0;
  
  return {
    total: global.requestCount,
    errors: global.errorCount,
    averageResponseTime: Math.round(averageResponseTime),
    requestsPerSecond: Math.round(requestsPerSecond * 100) / 100,
    lastError: global.lastError || undefined,
    lastErrorTime: global.lastErrorTime || undefined,
    uptime: Math.round(uptime)
  };
}

async function getQueueMetrics() {
  try {
    // Skip during build time or when Redis is not available
    if (process.env.NODE_ENV === 'production' && !process.env.REDIS_URL) {
      return {
        waiting: 0,
        active: 0,
        completed: 0,
        failed: 0,
        delayed: 0,
        error: 'Queue system not available'
      };
    }

    const { agentQueue } = await import('../../../../lib/queue/producer');
    const stats = await agentQueue.getJobCounts();
    
    return {
      waiting: stats.waiting,
      active: stats.active,
      completed: stats.completed,
      failed: stats.failed,
      delayed: stats.delayed,
      queueName: agentQueue.name
    };
  } catch (error) {
    return {
      waiting: 0,
      active: 0,
      completed: 0,
      failed: 0,
      delayed: 0,
      error: error.message
    };
  }
}

// Helper function to record request metrics
export function recordRequestMetrics(duration: number, isError: boolean = false, error?: string) {
  global.requestCount++;
  global.totalResponseTime += duration;
  
  if (isError) {
    global.errorCount++;
    if (error) {
      global.lastError = error;
      global.lastErrorTime = new Date().toISOString();
    }
  }
}
