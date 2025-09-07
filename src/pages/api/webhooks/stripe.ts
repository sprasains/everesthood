import { env } from '@/env.mjs';
import { buffer } from 'micro';
import { NextApiRequest, NextApiResponse } from 'next';
import Stripe from 'stripe';
import { prisma } from '@/server/db';
import { logger } from '@/lib/logger';

const stripe = new Stripe(env.STRIPE_SECRET_KEY, {
  apiVersion: '2023-10-16',
});

const webhookSecret = env.STRIPE_WEBHOOK_SECRET;

export const config = {
  api: {
    bodyParser: false,
  },
};

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return res.status(405).end('Method Not Allowed');
  }

  try {
    const buf = await buffer(req);
    const sig = req.headers['stripe-signature'];

    if (!sig || !webhookSecret) {
      return res
        .status(400)
        .json({ error: 'Missing signature or webhook secret' });
    }

    const event = stripe.webhooks.constructEvent(buf, sig, webhookSecret);

    logger.info({ type: event.type }, 'Processing Stripe webhook');

    switch (event.type) {
      case 'customer.subscription.created':
      case 'customer.subscription.updated': {
        const subscription = event.data.object as Stripe.Subscription;
        await handleSubscriptionUpdate(subscription);
        break;
      }

      case 'customer.subscription.deleted': {
        const subscription = event.data.object as Stripe.Subscription;
        await handleSubscriptionDeletion(subscription);
        break;
      }

      case 'usage_record.updated': {
        const usage = event.data.object as Stripe.UsageRecord;
        await handleUsageUpdate(usage);
        break;
      }

      case 'invoice.paid': {
        const invoice = event.data.object as Stripe.Invoice;
        await handleInvoicePaid(invoice);
        break;
      }

      case 'invoice.payment_failed': {
        const invoice = event.data.object as Stripe.Invoice;
        await handleInvoiceFailed(invoice);
        break;
      }

      default:
        logger.warn({ type: event.type }, 'Unhandled webhook event');
    }

    res.json({ received: true });
  } catch (error) {
    logger.error(error, 'Error handling webhook');
    return res.status(400).json({
      error: error instanceof Error ? error.message : 'Unknown error',
    });
  }
}

async function handleSubscriptionUpdate(subscription: Stripe.Subscription) {
  const billing = await prisma.billing.findFirst({
    where: { stripeSubscriptionId: subscription.id },
  });

  if (!billing) {
    logger.warn({ subscriptionId: subscription.id }, 'Subscription not found');
    return;
  }

  await prisma.billing.update({
    where: { id: billing.id },
    data: {
      status: subscription.status,
      currentPeriodEnd: new Date(subscription.current_period_end * 1000),
      cancelAtPeriodEnd: subscription.cancel_at_period_end,
    },
  });
}

async function handleSubscriptionDeletion(subscription: Stripe.Subscription) {
  const billing = await prisma.billing.findFirst({
    where: { stripeSubscriptionId: subscription.id },
  });

  if (!billing) {
    logger.warn({ subscriptionId: subscription.id }, 'Subscription not found');
    return;
  }

  await prisma.billing.update({
    where: { id: billing.id },
    data: {
      status: 'canceled',
      stripeSubscriptionId: null,
      cancelAtPeriodEnd: false,
    },
  });
}

async function handleUsageUpdate(usage: Stripe.UsageRecord) {
  const billing = await prisma.billing.findFirst({
    where: { stripeSubscriptionId: usage.subscription },
  });

  if (!billing) {
    logger.warn(
      { subscriptionId: usage.subscription },
      'Subscription not found'
    );
    return;
  }

  await prisma.billing.update({
    where: { id: billing.id },
    data: {
      currentUsage: usage.total,
      lastUpdated: new Date(),
    },
  });

  // Create usage record
  await prisma.usageRecord.create({
    data: {
      billingId: billing.id,
      quantity: usage.quantity,
      timestamp: new Date(usage.timestamp * 1000),
    },
  });
}

async function handleInvoicePaid(invoice: Stripe.Invoice) {
  const billing = await prisma.billing.findFirst({
    where: {
      stripeCustomerId: invoice.customer as string,
    },
  });

  if (!billing) {
    logger.warn({ customerId: invoice.customer }, 'Customer not found');
    return;
  }

  // Add credits based on plan
  if (invoice.lines.data.length > 0) {
    const item = invoice.lines.data[0];
    const credits = calculateCredits(item.price?.id);

    if (credits > 0) {
      await prisma.user.update({
        where: { id: billing.userId },
        data: {
          credits: { increment: credits },
        },
      });
    }
  }
}

async function handleInvoiceFailed(invoice: Stripe.Invoice) {
  const billing = await prisma.billing.findFirst({
    where: {
      stripeCustomerId: invoice.customer as string,
    },
  });

  if (!billing) {
    logger.warn({ customerId: invoice.customer }, 'Customer not found');
    return;
  }

  // Update billing status
  await prisma.billing.update({
    where: { id: billing.id },
    data: {
      status: 'past_due',
    },
  });

  // TODO: Send notification to user
}

function calculateCredits(priceId?: string): number {
  // Map price IDs to credit amounts
  const creditMap: Record<string, number> = {
    price_starter: 100,
    price_pro: 500,
    price_enterprise: 2000,
  };

  return priceId ? creditMap[priceId] || 0 : 0;
}
