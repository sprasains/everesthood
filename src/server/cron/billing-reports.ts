import { CronJob } from 'bullmq';
import { prisma } from '@/server/db';
import { scheduleReport } from '@/lib/billing/reports';
import { addDays, startOfMonth, endOfMonth, subDays } from 'date-fns';
import { logger } from '@/lib/logger';

// Schedule monthly reports on the 1st of each month
new CronJob(
  'generate-monthly-reports',
  '0 0 1 * *', // At midnight on the first day of the month
  async () => {
    const users = await prisma.user.findMany({
      where: {
        billing: {
          status: 'active',
        },
      },
      select: {
        id: true,
      },
    });

    const lastMonth = new Date();
    lastMonth.setMonth(lastMonth.getMonth() - 1);

    for (const user of users) {
      try {
        await scheduleReport({
          userId: user.id,
          startDate: startOfMonth(lastMonth).toISOString(),
          endDate: endOfMonth(lastMonth).toISOString(),
          type: 'monthly',
        });
      } catch (error) {
        logger.error(
          { userId: user.id, error },
          'Failed to schedule monthly report'
        );
      }
    }
  },
  {
    connection: {
      host: process.env.REDIS_URL,
    },
  }
);

// Schedule weekly reports every Monday
new CronJob(
  'generate-weekly-reports',
  '0 0 * * 1', // At midnight on Monday
  async () => {
    const users = await prisma.user.findMany({
      where: {
        billing: {
          status: 'active',
        },
      },
      select: {
        id: true,
      },
    });

    const endDate = subDays(new Date(), 1); // Yesterday
    const startDate = subDays(endDate, 7); // 7 days before

    for (const user of users) {
      try {
        await scheduleReport({
          userId: user.id,
          startDate: startDate.toISOString(),
          endDate: endDate.toISOString(),
          type: 'weekly',
        });
      } catch (error) {
        logger.error(
          { userId: user.id, error },
          'Failed to schedule weekly report'
        );
      }
    }
  },
  {
    connection: {
      host: process.env.REDIS_URL,
    },
  }
);
