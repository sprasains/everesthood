import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { addDays, isToday } from 'date-fns';

export async function POST(req: Request) {
  // Basic authentication: Use a secret token to secure this endpoint
  const authHeader = req.headers.get('Authorization');
  const authToken = process.env.QUOTA_RESET_AUTH_TOKEN;

  if (!authHeader || !authToken || authHeader !== `Bearer ${authToken}`) {
    return new NextResponse('Unauthorized', { status: 401 });
  }

  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0); // Normalize to start of day

    // Find users whose billing cycle ends today (or has already passed today)
    const usersToReset = await prisma.user.findMany({
      where: {
        stripeCurrentPeriodEnd: {
          lte: addDays(today, 1), // Less than or equal to end of today
        },
        currentMonthExecutionCount: {
          gt: 0, // Only reset if there's usage to reset
        },
      },
      select: {
        id: true,
        stripeCurrentPeriodEnd: true,
      },
    });

    let resetCount = 0;
    for (const user of usersToReset) {
      if (user.stripeCurrentPeriodEnd && isToday(user.stripeCurrentPeriodEnd)) {
        await prisma.user.update({
          where: {
            id: user.id,
          },
          data: {
            currentMonthExecutionCount: 0,
          },
        });
        resetCount++;
        console.log(`Reset execution count for user ${user.id}.`);
      }
    }

    return new NextResponse(`Successfully reset quotas for ${resetCount} users.`, { status: 200 });
  } catch (error) {
    console.error('Error resetting quotas:', error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
}
