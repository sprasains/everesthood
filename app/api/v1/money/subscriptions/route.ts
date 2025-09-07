import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function GET(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id)
    return new NextResponse('Unauthorized', { status: 401 });

  const url = new URL(req.url);
  const status = url.searchParams.get('status'); // active, cancelled, all

  const where = {
    userId: session.user.id,
    ...(status === 'active' ? { endDate: null } : {}),
    ...(status === 'cancelled' ? { endDate: { not: null } } : {}),
  };

  const subscriptions = await prisma.subscription.findMany({
    where,
    include: {
      category: true,
    },
    orderBy: [{ nextBillingDate: 'asc' }, { amount: 'desc' }],
  });

  // Calculate annual cost for each subscription
  interface Subscription {
    amount: number;
    billingPeriod: 'MONTHLY' | 'YEARLY' | 'QUARTERLY';
  }

  const subsWithAnnualCost = subscriptions.map((sub: Subscription) => ({
    ...sub,
    annualCost:
      sub.amount *
      (sub.billingPeriod === 'MONTHLY'
        ? 12
        : sub.billingPeriod === 'QUARTERLY'
        ? 4
        : 1),
  }));

  const totalMonthly = subsWithAnnualCost.reduce(
    (sum: number, sub: Subscription & { annualCost: number }) =>
      sum +
      (sub.billingPeriod === 'MONTHLY' ? sub.amount : sub.annualCost / 12),
    0
  );

  return NextResponse.json({
    subscriptions: subsWithAnnualCost,
    summary: {
      totalMonthly,
      totalAnnual: totalMonthly * 12,
    },
  });
}

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id)
      return new NextResponse('Unauthorized', { status: 401 });

    const data = await req.json();
    const {
      name,
      amount,
      billingPeriod,
      categoryId,
      nextBillingDate,
      provider,
      notes,
    } = data;

    if (!name || !amount || !billingPeriod) {
      return NextResponse.json(
        { error: 'Name, amount, and billing period are required' },
        { status: 400 }
      );
    }

    const subscription = await prisma.subscription.create({
      data: {
        name,
        amount,
        billingPeriod,
        nextBillingDate: nextBillingDate ? new Date(nextBillingDate) : null,
        provider,
        notes,
        categoryId,
        userId: session.user.id,
      },
      include: {
        category: true,
      },
    });

    return NextResponse.json(subscription, { status: 201 });
  } catch (error) {
    console.error('Error creating subscription:', error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
}

export async function PUT(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id)
      return new NextResponse('Unauthorized', { status: 401 });

    const data = await req.json();
    const {
      id,
      name,
      amount,
      billingPeriod,
      categoryId,
      nextBillingDate,
      provider,
      notes,
      endDate,
    } = data;

    if (!id) {
      return NextResponse.json(
        { error: 'Subscription ID is required' },
        { status: 400 }
      );
    }

    const subscription = await prisma.subscription.update({
      where: {
        id,
        userId: session.user.id, // Ensure ownership
      },
      data: {
        name,
        amount,
        billingPeriod,
        categoryId,
        nextBillingDate: nextBillingDate
          ? new Date(nextBillingDate)
          : undefined,
        provider,
        notes,
        endDate: endDate ? new Date(endDate) : undefined,
      },
      include: {
        category: true,
      },
    });

    return NextResponse.json(subscription);
  } catch (error) {
    console.error('Error updating subscription:', error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
}

export async function DELETE(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id)
      return new NextResponse('Unauthorized', { status: 401 });

    const { id } = await req.json();
    if (!id) {
      return NextResponse.json(
        { error: 'Subscription ID is required' },
        { status: 400 }
      );
    }

    // Instead of deleting, mark as cancelled
    await prisma.subscription.update({
      where: {
        id,
        userId: session.user.id,
      },
      data: {
        endDate: new Date(),
      },
    });

    return new NextResponse(null, { status: 204 });
  } catch (error) {
    console.error('Error cancelling subscription:', error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
}
