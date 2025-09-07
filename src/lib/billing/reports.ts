import { prisma } from '@/server/db';
import { env } from '@/env.mjs';
import { Queue, Worker } from 'bullmq';
import type { Prisma } from '@prisma/client';
import { logger } from '@/lib/logger';
import { formatDate } from '@/lib/utils';

interface ReportJob {
  userId: string;
  startDate: string;
  endDate: string;
  type: 'daily' | 'weekly' | 'monthly';
}

const connection = {
  host: new URL(env.REDIS_URL).hostname,
  port: parseInt(new URL(env.REDIS_URL).port),
};

export const reportQueue = new Queue<ReportJob>('billing-reports', {
  connection,
});

const worker = new Worker<ReportJob>(
  'billing-reports',
  async (job) => {
    const { userId, startDate, endDate, type } = job.data;

    logger.info({ userId, type }, 'Generating billing report');

    try {
      // Get user's usage records
      const records = await prisma.usageRecord.findMany({
        where: {
          billing: {
            userId,
          },
          timestamp: {
            gte: new Date(startDate),
            lte: new Date(endDate),
          },
        },
        orderBy: {
          timestamp: 'asc',
        },
      });

      // Calculate period totals
      const periodTotals = calculatePeriodTotals(records, type);

      // Generate report
      const report = await prisma.billingReport.create({
        data: {
          userId,
          type,
          startDate: new Date(startDate),
          endDate: new Date(endDate),
          data: periodTotals,
          totalUsage: records.reduce((sum, r) => sum + r.quantity, 0),
          status: 'completed',
        },
      });

      // Store report file
      const reportFile = generateReportFile(periodTotals, type, {
        startDate,
        endDate,
        userId,
      });

      await prisma.billingReport.update({
        where: { id: report.id },
        data: {
          fileUrl: reportFile.url,
          fileType: reportFile.type,
        },
      });

      return report;
    } catch (error) {
      logger.error(error, 'Error generating billing report');
      throw error;
    }
  },
  { connection }
);

worker.on('completed', async (job) => {
  logger.info(
    { userId: job.data.userId, type: job.data.type },
    'Billing report generated successfully'
  );
});

worker.on('failed', async (job, error) => {
  if (!job) return;

  logger.error(
    { userId: job.data.userId, type: job.data.type, error },
    'Failed to generate billing report'
  );

  // Update report status
  await prisma.billingReport.updateMany({
    where: {
      userId: job.data.userId,
      startDate: new Date(job.data.startDate),
      endDate: new Date(job.data.endDate),
      type: job.data.type,
      status: 'pending',
    },
    data: {
      status: 'failed',
      error: error.message,
    },
  });
});

function calculatePeriodTotals(
  records: Array<{ timestamp: Date; quantity: number }>,
  type: 'daily' | 'weekly' | 'monthly'
): Array<{ period: string; usage: number }> {
  const totals = new Map<string, number>();

  for (const record of records) {
    let period: string;
    const date = record.timestamp;

    switch (type) {
      case 'daily':
        period = formatDate(date, 'yyyy-MM-dd');
        break;
      case 'weekly':
        period = `Week ${getWeekNumber(date)}`;
        break;
      case 'monthly':
        period = formatDate(date, 'yyyy-MM');
        break;
    }

    totals.set(period, (totals.get(period) || 0) + record.quantity);
  }

  return Array.from(totals.entries()).map(([period, usage]) => ({
    period,
    usage,
  }));
}

function getWeekNumber(date: Date): number {
  const d = new Date(date);
  d.setHours(0, 0, 0, 0);
  d.setDate(d.getDate() + 4 - (d.getDay() || 7));
  const yearStart = new Date(d.getFullYear(), 0, 1);
  return Math.ceil(((d.getTime() - yearStart.getTime()) / 86400000 + 1) / 7);
}

interface ReportFileOptions {
  startDate: string;
  endDate: string;
  userId: string;
}

function generateReportFile(
  data: Array<{ period: string; usage: number }>,
  type: string,
  options: ReportFileOptions
) {
  // Generate CSV
  const csv = [
    ['Period', 'Usage'],
    ...data.map(({ period, usage }) => [period, usage.toString()]),
  ]
    .map((row) => row.join(','))
    .join('\n');

  // TODO: Upload to storage provider
  const fileName = `usage-report-${options.userId}-${type}-${options.startDate}-${options.endDate}.csv`;

  return {
    url: `/reports/${fileName}`,
    type: 'csv',
  };
}

export function scheduleReport(job: ReportJob) {
  return reportQueue.add('generate-report', job, {
    attempts: 3,
    backoff: {
      type: 'exponential',
      delay: 5000,
    },
  });
}

export type { ReportJob };
