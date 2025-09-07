import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { z } from 'zod';

const createSubscriptionSchema = z.object({
  planId: z.string().min(1),
  billingPeriod: z.enum(['MONTHLY', 'YEARLY']),
  paymentMethodId: z.string().optional(),
});

const subscriptionPlans = [
  {
    id: 'free',
    name: 'Free',
    description: 'Basic features for getting started',
    price: 0,
    currency: 'USD',
    billingPeriod: 'MONTHLY',
    features: [
      'Basic agent templates',
      'Limited AI summaries',
      'Community access',
      'Basic support'
    ],
    limits: {
      agentInstances: 3,
      aiSummaries: 10,
      storage: '1GB'
    }
  },
  {
    id: 'pro',
    name: 'Pro',
    description: 'Advanced features for professionals',
    price: 29,
    currency: 'USD',
    billingPeriod: 'MONTHLY',
    features: [
      'Unlimited agent templates',
      'Unlimited AI summaries',
      'Advanced analytics',
      'Priority support',
      'Custom integrations',
      'API access'
    ],
    limits: {
      agentInstances: 50,
      aiSummaries: -1, // unlimited
      storage: '10GB'
    }
  },
  {
    id: 'enterprise',
    name: 'Enterprise',
    description: 'Full features for teams and organizations',
    price: 99,
    currency: 'USD',
    billingPeriod: 'MONTHLY',
    features: [
      'Everything in Pro',
      'Team collaboration',
      'Advanced security',
      'Custom branding',
      'Dedicated support',
      'SLA guarantee'
    ],
    limits: {
      agentInstances: -1, // unlimited
      aiSummaries: -1, // unlimited
      storage: '100GB'
    }
  }
];

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const url = new URL(request.url);
    const includePlans = url.searchParams.get('includePlans') === 'true';

    // Get user's current subscription
    const currentSubscription = await prisma.subscription.findFirst({
      where: {
        userId: session.user.id,
        status: { in: ['ACTIVE', 'TRIALING', 'PAST_DUE'] }
      },
      orderBy: { createdAt: 'desc' }
    });

    // Get subscription history
    const subscriptionHistory = await prisma.subscription.findMany({
      where: { userId: session.user.id },
      orderBy: { createdAt: 'desc' },
      take: 10
    });

    const response: any = {
      currentSubscription,
      subscriptionHistory,
      usage: {
        agentInstances: 0,
        aiSummaries: 0,
        storage: 0
      }
    };

    // Get current usage
    if (currentSubscription) {
      const [agentCount, summaryCount] = await Promise.all([
        prisma.agentInstance.count({
          where: { userId: session.user.id }
        }),
        prisma.aISummary.count({
          where: { userId: session.user.id }
        })
      ]);

      response.usage = {
        agentInstances: agentCount,
        aiSummaries: summaryCount,
        storage: 0 // Placeholder - would need file storage tracking
      };
    }

    if (includePlans) {
      response.plans = subscriptionPlans;
    }

    return NextResponse.json(response);

  } catch (error) {
    console.error('Error fetching subscriptions:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const validatedData = createSubscriptionSchema.parse(body);

    // Check if user already has an active subscription
    const existingSubscription = await prisma.subscription.findFirst({
      where: {
        userId: session.user.id,
        status: { in: ['ACTIVE', 'TRIALING', 'PAST_DUE'] }
      }
    });

    if (existingSubscription) {
      return NextResponse.json(
        { error: 'User already has an active subscription' },
        { status: 400 }
      );
    }

    // Find the selected plan
    const selectedPlan = subscriptionPlans.find(plan => plan.id === validatedData.planId);
    if (!selectedPlan) {
      return NextResponse.json(
        { error: 'Invalid plan selected' },
        { status: 400 }
      );
    }

    // Calculate pricing
    const amount = selectedPlan.price;
    const startDate = new Date();
    const endDate = new Date();
    
    if (validatedData.billingPeriod === 'YEARLY') {
      endDate.setFullYear(endDate.getFullYear() + 1);
    } else {
      endDate.setMonth(endDate.getMonth() + 1);
    }

    // Create subscription (simulated - in real app, integrate with Stripe)
    const subscription = await prisma.subscription.create({
      data: {
        userId: session.user.id,
        planId: validatedData.planId,
        status: 'ACTIVE',
        startDate,
        endDate,
        nextBillingDate: endDate,
        amount,
        currency: selectedPlan.currency,
        billingPeriod: validatedData.billingPeriod,
        stripeSubscriptionId: `sub_${Date.now()}_${session.user.id}` // Simulated
      }
    });

    // Create notification
    await prisma.notification.create({
      data: {
        userId: session.user.id,
        type: 'subscription',
        title: 'Subscription Activated!',
        message: `Your ${selectedPlan.name} subscription has been activated successfully.`,
        data: { 
          subscriptionId: subscription.id,
          planName: selectedPlan.name,
          amount: amount
        }
      }
    });

    return NextResponse.json(subscription, { status: 201 });

  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Validation error', details: error.errors },
        { status: 400 }
      );
    }

    console.error('Error creating subscription:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
