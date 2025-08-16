import Stripe from 'stripe';
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, { apiVersion: '2023-10-16' });

import { prisma } from '../../prisma';

// Resolve Stripe customer for user
export async function resolveCustomer(userId: string, email: string) {
  // Check DB for existing customerId
  const user = await prisma.user.findUnique({ where: { id: userId } });
  let customerId = user?.billingAccount?.stripeCustomerId;
  if (!customerId) {
    const customer = await stripe.customers.create({ email, metadata: { userId } });
    customerId = customer.id;
    await prisma.billingAccount.update({
      where: { userId },
      data: { stripeCustomerId: customerId },
    });
  }
  return customerId;
}

// Record usage for metered price
export async function recordUsage({ userId, customerId, tokensUsed, steps, wallTime, toolCalls, cost, dryRun = false }: {
  userId: string;
  customerId: string;
  tokensUsed: number;
  steps: number;
  wallTime: number;
  toolCalls: number;
  cost: number;
  dryRun?: boolean;
}) {
  if (dryRun) {
    console.log('[DRY RUN] Usage:', { userId, customerId, tokensUsed, steps, wallTime, toolCalls, cost });
    return;
  }
  // Report usage to Stripe (metered price)
  await stripe.subscriptionItems.createUsageRecord(
    process.env.STRIPE_AGENT_USAGE_ITEM_ID!,
    {
      quantity: tokensUsed, // or aggregate usage units
      timestamp: Math.floor(Date.now() / 1000),
      action: 'increment',
    }
  );
  // Optionally, record cost and details in DB
  await prisma.usageMeter.create({
    data: {
      userId,
      model: 'agent',
      tool: 'run',
      count: tokensUsed,
      periodStart: new Date(),
      periodEnd: new Date(),
    },
  });
}
