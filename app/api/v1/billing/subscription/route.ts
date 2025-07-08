import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { stripe } from '@/lib/stripe';

// Define a mapping for price IDs to execution limits
const priceIdToLimitMap: { [key: string]: number } = {
  [process.env.STRIPE_FREE_PRICE_ID as string]: 100, // Example: Free tier gets 100 executions
  [process.env.STRIPE_STARTER_PRICE_ID as string]: 1000, // Example: Starter tier gets 1000 executions
  [process.env.STRIPE_PRO_PRICE_ID as string]: 10000, // Example: Pro tier gets 10000 executions
};

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || !session.user || !session.user.id) {
      return new NextResponse('Unauthorized', { status: 401 });
    }

    const userId = session.user.id;
    const { newPriceId } = await req.json();

    if (!newPriceId) {
      return new NextResponse('New price ID is required', { status: 400 });
    }

    const user = await prisma.user.findUnique({
      where: {
        id: userId,
      },
      select: {
        stripeCustomerId: true,
        stripeSubscriptionId: true,
        stripePriceId: true,
      },
    });

    if (!user || !user.stripeCustomerId || !user.stripeSubscriptionId) {
      return new NextResponse('User has no active Stripe subscription', { status: 400 });
    }

    // Retrieve the current subscription
    const subscription = await stripe.subscriptions.retrieve(user.stripeSubscriptionId);

    // Find the current subscription item for the product
    const currentSubscriptionItem = subscription.items.data.find(
      (item) => item.price.id === user.stripePriceId
    );

    if (!currentSubscriptionItem) {
      return new NextResponse('Current subscription item not found', { status: 400 });
    }

    // Update the subscription in Stripe
    const updatedSubscription = await stripe.subscriptions.update(
      user.stripeSubscriptionId,
      {
        items: [
          {
            id: currentSubscriptionItem.id,
            price: newPriceId, // Switch to the new price
          },
        ],
        proration_behavior: 'create_prorations', // Handle proration automatically
      }
    );

    // Update user's monthlyExecutionLimit and stripePriceId in the database
    const newLimit = priceIdToLimitMap[newPriceId];

    if (newLimit === undefined) {
      console.warn(`No execution limit defined for price ID: ${newPriceId}`);
      // Optionally, handle this case by setting a default or returning an error
    }

    await prisma.user.update({
      where: {
        id: userId,
      },
      data: {
        stripePriceId: newPriceId,
        monthlyExecutionLimit: newLimit !== undefined ? newLimit : user.monthlyExecutionLimit, // Keep old limit if new not found
        stripeCurrentPeriodEnd: new Date(updatedSubscription.current_period_end * 1000), // Update period end from Stripe
      },
    });

    return new NextResponse('Subscription plan updated successfully', { status: 200 });
  } catch (error: any) {
    console.error('Error updating subscription plan:', error);
    // More granular error handling for Stripe errors could be added here
    return new NextResponse(error.message || 'Internal Server Error', { status: 500 });
  }
}
