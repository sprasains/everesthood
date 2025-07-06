import { NextResponse } from 'next/server';
import { stripe } from '@/lib/stripe';
import prisma from '@/lib/prisma';

export async function POST(req: Request) {
  // Basic authentication: Use a secret token to secure this endpoint
  const authHeader = req.headers.get('Authorization');
  const authToken = process.env.STRIPE_SYNC_AUTH_TOKEN;

  if (!authHeader || !authToken || authHeader !== `Bearer ${authToken}`) {
    return new NextResponse('Unauthorized', { status: 401 });
  }

  try {
    // Fetch all users with an active Stripe subscription
    const users = await prisma.user.findMany({
      where: {
        stripeSubscriptionId: { not: null },
        stripePriceId: { not: null },
      },
      select: {
        id: true,
        stripeCustomerId: true,
        stripeSubscriptionId: true,
        stripePriceId: true,
        currentMonthExecutionCount: true,
      },
    });

    for (const user of users) {
      if (!user.stripeCustomerId || !user.stripeSubscriptionId || !user.stripePriceId) {
        console.warn(`Skipping user ${user.id} due to missing Stripe info.`);
        continue;
      }

      // Find the subscription item for the specific price (product)
      const subscription = await stripe.subscriptions.retrieve(user.stripeSubscriptionId);
      const subscriptionItem = subscription.items.data.find(
        (item) => item.price.id === user.stripePriceId
      );

      if (!subscriptionItem) {
        console.warn(`No subscription item found for price ${user.stripePriceId} for user ${user.id}`);
        continue;
      }

      // Report usage to Stripe
      await stripe.subscriptionItems.createUsageRecord(
        subscriptionItem.id,
        {
          quantity: user.currentMonthExecutionCount,
          timestamp: Math.floor(Date.now() / 1000), // Current timestamp in seconds
          action: 'set', // Set the usage to the current count
        }
      );
      console.log(`Reported ${user.currentMonthExecutionCount} executions for user ${user.id} to Stripe.`);

      // Optionally, reset currentMonthExecutionCount after successful reporting
      // This depends on whether the cron job runs monthly or if Stripe handles resets.
      // For now, we'll assume Stripe handles the billing cycle, and we just report.
      // The reset logic will be handled by Task 77 (Quota Reset Cron Job).
    }

    return new NextResponse('Stripe usage sync completed', { status: 200 });
  } catch (error) {
    console.error('Error syncing Stripe usage:', error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
}
