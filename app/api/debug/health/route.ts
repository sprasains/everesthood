import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { getRedis } from '@/lib/queue/connection';
import fs from 'fs';
import path from 'path';

export const dynamic = 'force-dynamic';

interface HealthStatus {
  status: 'healthy' | 'unhealthy' | 'degraded';
  latency?: number;
  error?: string;
  details?: any;
}

interface SystemHealth {
  timestamp: string;
  services: {
    database: HealthStatus;
    redis: HealthStatus;
    queue: HealthStatus;
    storage: HealthStatus;
    auth: HealthStatus;
  };
  system: {
    memory: NodeJS.MemoryUsage;
    uptime: number;
    version: string;
    platform: string;
    arch: string;
    pid: number;
  };
  environment: {
    nodeEnv: string;
    features: {
      redis: boolean;
      sentry: boolean;
      stripe: boolean;
      auth: boolean;
    };
  };
  metrics: {
    requestCount: number;
    errorCount: number;
    averageResponseTime: number;
    lastError?: string;
  };
}

export async function GET(req: NextRequest) {
  const session = await getServerSession(authOptions);
  
  if (!session || session.user.role !== 'ADMIN') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
  }

  try {
    const health: SystemHealth = {
      timestamp: new Date().toISOString(),
      services: {
        database: await checkDatabase(),
        redis: await checkRedis(),
        queue: await checkQueue(),
        storage: await checkStorage(),
        auth: await checkAuth()
      },
      system: {
        memory: process.memoryUsage(),
        uptime: process.uptime(),
        version: process.version,
        platform: process.platform,
        arch: process.arch,
        pid: process.pid
      },
      environment: {
        nodeEnv: process.env.NODE_ENV || 'development',
        features: {
          redis: !!process.env.REDIS_URL,
          sentry: !!process.env.SENTRY_DSN,
          stripe: !!process.env.STRIPE_SECRET_KEY,
          auth: !!process.env.NEXTAUTH_SECRET
        }
      },
      metrics: await getSystemMetrics()
    };

    // Determine overall health status
    const serviceStatuses = Object.values(health.services).map(s => s.status);
    const hasUnhealthy = serviceStatuses.includes('unhealthy');
    const hasDegraded = serviceStatuses.includes('degraded');
    
    const overallStatus = hasUnhealthy ? 'unhealthy' : 
                         hasDegraded ? 'degraded' : 'healthy';

    return NextResponse.json({
      ...health,
      status: overallStatus
    });
  } catch (error) {
    return NextResponse.json({
      error: error.message,
      timestamp: new Date().toISOString(),
      status: 'unhealthy'
    }, { status: 500 });
  }
}

async function checkDatabase(): Promise<HealthStatus> {
  try {
    const startTime = Date.now();
    await prisma.$queryRaw`SELECT 1`;
    const endTime = Date.now();
    
    // Check connection pool
    const poolInfo = await prisma.$queryRaw`
      SELECT 
        count(*) as total_connections,
        count(*) FILTER (WHERE state = 'active') as active_connections,
        count(*) FILTER (WHERE state = 'idle') as idle_connections
      FROM pg_stat_activity 
      WHERE datname = current_database()
    `;
    
    return { 
      status: 'healthy', 
      latency: endTime - startTime,
      details: poolInfo
    };
  } catch (error) {
    return { 
      status: 'unhealthy', 
      error: error.message 
    };
  }
}

async function checkRedis(): Promise<HealthStatus> {
  try {
    const redis = getRedis();
    if (!redis) {
      return { 
        status: 'degraded', 
        error: 'Redis not configured' 
      };
    }
    
    const startTime = Date.now();
    await redis.ping();
    const endTime = Date.now();
    
    // Get Redis info
    const info = await redis.info('memory');
    const memoryInfo = info.split('\r\n').reduce((acc, line) => {
      const [key, value] = line.split(':');
      if (key && value) {
        acc[key] = value;
      }
      return acc;
    }, {} as Record<string, string>);
    
    return { 
      status: 'healthy', 
      latency: endTime - startTime,
      details: {
        memory: memoryInfo,
        connected: true
      }
    };
  } catch (error) {
    return { 
      status: 'unhealthy', 
      error: error.message 
    };
  }
}

async function checkQueue(): Promise<HealthStatus> {
  try {
    // Skip during build time or when Redis is not available
    if (process.env.NODE_ENV === 'production' && !process.env.REDIS_URL) {
      return { 
        status: 'degraded', 
        error: 'Queue system not available' 
      };
    }

    const { agentQueue } = await import('../../../../lib/queue/producer');
    const stats = await agentQueue.getJobCounts();
    
    return { 
      status: 'healthy', 
      details: {
        stats,
        queueName: agentQueue.name
      }
    };
  } catch (error) {
    return { 
      status: 'unhealthy', 
      error: error.message 
    };
  }
}

async function checkStorage(): Promise<HealthStatus> {
  try {
    const uploadsDir = path.join(process.cwd(), 'uploads');
    const logsDir = path.join(process.cwd(), 'logs');
    
    const uploadsExists = fs.existsSync(uploadsDir);
    const logsExists = fs.existsSync(logsDir);
    
    let uploadsWritable = false;
    let logsWritable = false;
    
    if (uploadsExists) {
      try {
        fs.accessSync(uploadsDir, fs.constants.W_OK);
        uploadsWritable = true;
      } catch {}
    }
    
    if (logsExists) {
      try {
        fs.accessSync(logsDir, fs.constants.W_OK);
        logsWritable = true;
      } catch {}
    }
    
    const status = uploadsWritable && logsWritable ? 'healthy' : 'degraded';
    
    return { 
      status, 
      details: {
        uploads: { exists: uploadsExists, writable: uploadsWritable },
        logs: { exists: logsExists, writable: logsWritable }
      }
    };
  } catch (error) {
    return { 
      status: 'unhealthy', 
      error: error.message 
    };
  }
}

async function checkAuth(): Promise<HealthStatus> {
  try {
    const requiredEnvVars = [
      'NEXTAUTH_SECRET',
      'NEXTAUTH_URL'
    ];
    
    const missing = requiredEnvVars.filter(envVar => !process.env[envVar]);
    
    if (missing.length > 0) {
      return { 
        status: 'unhealthy', 
        error: `Missing environment variables: ${missing.join(', ')}` 
      };
    }
    
    // Check if we can create a session
    const testSession = {
      user: { id: 'test', email: 'test@example.com', role: 'USER' },
      expires: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString()
    };
    
    return { 
      status: 'healthy', 
      details: {
        providers: {
          google: !!process.env.GOOGLE_CLIENT_ID,
          github: !!process.env.GITHUB_CLIENT_ID,
          credentials: true
        }
      }
    };
  } catch (error) {
    return { 
      status: 'unhealthy', 
      error: error.message 
    };
  }
}

async function getSystemMetrics() {
  // In a real implementation, these would come from a metrics store
  return {
    requestCount: global.requestCount || 0,
    errorCount: global.errorCount || 0,
    averageResponseTime: global.averageResponseTime || 0,
    lastError: global.lastError || undefined
  };
}
