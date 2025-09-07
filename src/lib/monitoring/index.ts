import { Prisma } from '@prisma/client';
import { getLogger } from '@/lib/logger';
import { Redis } from '@/lib/cache';
import { captureException, setTag } from '@sentry/nextjs';
import { env } from '@/env.mjs';

const logger = getLogger('monitoring');
const redis = Redis.getInstance();

// Metric types
interface Metric {
  name: string;
  value: number;
  tags?: Record<string, string>;
  timestamp?: Date;
}

interface Alert {
  name: string;
  level: 'info' | 'warning' | 'error' | 'critical';
  message: string;
  data?: any;
}

// Alert thresholds
const THRESHOLDS = {
  ERROR_RATE: 0.05, // 5% error rate
  RESPONSE_TIME: 1000, // 1 second
  CPU_USAGE: 80, // 80%
  MEMORY_USAGE: 80, // 80%
  DISK_USAGE: 80, // 80%
  CACHE_HIT_RATE: 0.8, // 80%
};

class Monitoring {
  private static instance: Monitoring;
  private metricsBuffer: Metric[] = [];
  private readonly flushInterval = 10000; // 10 seconds

  private constructor() {
    this.startMetricsFlush();
  }

  static getInstance(): Monitoring {
    if (!Monitoring.instance) {
      Monitoring.instance = new Monitoring();
    }
    return Monitoring.instance;
  }

  // Record metrics
  async recordMetric(metric: Metric): Promise<void> {
    this.metricsBuffer.push({
      ...metric,
      timestamp: metric.timestamp || new Date(),
    });

    // Check for alerts
    await this.checkAlerts(metric);
  }

  // Record response time
  async recordResponseTime(path: string, duration: number): Promise<void> {
    await this.recordMetric({
      name: 'response_time',
      value: duration,
      tags: { path },
    });

    if (duration > THRESHOLDS.RESPONSE_TIME) {
      await this.sendAlert({
        name: 'high_response_time',
        level: 'warning',
        message: `High response time (${duration}ms) for ${path}`,
        data: { path, duration },
      });
    }
  }

  // Record error
  async recordError(error: Error, context?: any): Promise<void> {
    // Record error metric
    await this.recordMetric({
      name: 'error_count',
      value: 1,
      tags: {
        type: error.name,
        message: error.message,
      },
    });

    // Send to error tracking
    captureException(error, {
      extra: context,
    });

    // Log error
    logger.error({ error, context }, 'Application error');
  }

  // Monitor database metrics
  async monitorDatabase(): Promise<void> {
    try {
      const result = await prisma.$queryRaw`
        SELECT 
          (SELECT count(*) FROM pg_stat_activity) as connections,
          pg_database_size(current_database()) as size,
          (SELECT count(*) FROM pg_stat_activity WHERE state = 'active') as active_queries
      `;

      await this.recordMetric({
        name: 'db_connections',
        value: (result as any)[0].connections,
      });

      await this.recordMetric({
        name: 'db_size',
        value: (result as any)[0].size,
      });

      await this.recordMetric({
        name: 'db_active_queries',
        value: (result as any)[0].active_queries,
      });
    } catch (error) {
      await this.recordError(error as Error, {
        context: 'database_monitoring',
      });
    }
  }

  // Monitor cache metrics
  async monitorCache(): Promise<void> {
    try {
      const info = await redis.info();
      const stats = {
        usedMemory: parseInt(info.match(/used_memory:(\d+)/)?.[1] || '0'),
        hits: parseInt(info.match(/keyspace_hits:(\d+)/)?.[1] || '0'),
        misses: parseInt(info.match(/keyspace_misses:(\d+)/)?.[1] || '0'),
      };

      await this.recordMetric({
        name: 'cache_memory',
        value: stats.usedMemory,
      });

      const hitRate = stats.hits / (stats.hits + stats.misses);
      await this.recordMetric({
        name: 'cache_hit_rate',
        value: hitRate,
      });

      if (hitRate < THRESHOLDS.CACHE_HIT_RATE) {
        await this.sendAlert({
          name: 'low_cache_hit_rate',
          level: 'warning',
          message: `Low cache hit rate: ${(hitRate * 100).toFixed(2)}%`,
          data: stats,
        });
      }
    } catch (error) {
      await this.recordError(error as Error, { context: 'cache_monitoring' });
    }
  }

  // Monitor system metrics
  async monitorSystem(): Promise<void> {
    const { cpuUsage, memoryUsage } = process;

    const cpu = cpuUsage();
    const memory = memoryUsage();

    await this.recordMetric({
      name: 'cpu_usage',
      value: (cpu.user + cpu.system) / 1000000, // Convert to milliseconds
    });

    await this.recordMetric({
      name: 'memory_usage',
      value: (memory.heapUsed / memory.heapTotal) * 100,
    });

    if ((memory.heapUsed / memory.heapTotal) * 100 > THRESHOLDS.MEMORY_USAGE) {
      await this.sendAlert({
        name: 'high_memory_usage',
        level: 'warning',
        message: 'High memory usage detected',
        data: memory,
      });
    }
  }

  // Check for alerts based on metrics
  private async checkAlerts(metric: Metric): Promise<void> {
    switch (metric.name) {
      case 'error_count':
        const errorRate = await this.calculateErrorRate();
        if (errorRate > THRESHOLDS.ERROR_RATE) {
          await this.sendAlert({
            name: 'high_error_rate',
            level: 'error',
            message: `High error rate detected: ${(errorRate * 100).toFixed(
              2
            )}%`,
            data: { errorRate },
          });
        }
        break;

      case 'response_time':
        if (metric.value > THRESHOLDS.RESPONSE_TIME) {
          await this.sendAlert({
            name: 'high_response_time',
            level: 'warning',
            message: `High response time detected: ${metric.value}ms`,
            data: { responseTime: metric.value },
          });
        }
        break;
    }
  }

  // Calculate error rate
  private async calculateErrorRate(): Promise<number> {
    const errors = this.metricsBuffer.filter(
      (m) => m.name === 'error_count'
    ).length;

    const requests = this.metricsBuffer.filter(
      (m) => m.name === 'request_count'
    ).length;

    return requests ? errors / requests : 0;
  }

  // Send alert
  private async sendAlert(alert: Alert): Promise<void> {
    // Log alert
    logger.warn({ alert }, 'Alert triggered');

    // Store in Redis for dashboard
    await redis.lpush(
      'alerts',
      JSON.stringify({
        ...alert,
        timestamp: new Date(),
      })
    );

    // Send to external monitoring service
    if (env.DATADOG_API_KEY) {
      await fetch('https://api.datadoghq.com/api/v1/events', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'DD-API-KEY': env.DATADOG_API_KEY,
        },
        body: JSON.stringify({
          title: alert.name,
          text: alert.message,
          priority: alert.level,
          tags: ['env:production'],
          alert_type: alert.level,
        }),
      });
    }

    // Send critical alerts to Slack
    if (alert.level === 'critical' && env.SLACK_WEBHOOK_URL) {
      await fetch(env.SLACK_WEBHOOK_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          text: `🚨 *CRITICAL ALERT*\n${alert.message}`,
          attachments: [
            {
              color: '#ff0000',
              fields: [
                {
                  title: 'Alert Name',
                  value: alert.name,
                  short: true,
                },
                {
                  title: 'Timestamp',
                  value: new Date().toISOString(),
                  short: true,
                },
                {
                  title: 'Details',
                  value: '```' + JSON.stringify(alert.data, null, 2) + '```',
                },
              ],
            },
          ],
        }),
      });
    }
  }

  // Start metrics flush interval
  private startMetricsFlush(): void {
    setInterval(async () => {
      if (this.metricsBuffer.length === 0) return;

      try {
        // Store metrics in database
        await prisma.metric.createMany({
          data: this.metricsBuffer.map((metric) => ({
            name: metric.name,
            value: metric.value,
            tags: metric.tags,
            timestamp: metric.timestamp!,
          })),
        });

        // Clear buffer
        this.metricsBuffer = [];
      } catch (error) {
        logger.error({ error }, 'Failed to flush metrics');
      }
    }, this.flushInterval);
  }
}

export const monitoring = Monitoring.getInstance();
