import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const url = new URL(request.url);
    const page = parseInt(url.searchParams.get('page') || '1');
    const limit = parseInt(url.searchParams.get('limit') || '20');
    const startDate = url.searchParams.get('startDate');
    const endDate = url.searchParams.get('endDate');

    const where: any = {
      userId: session.user.id
    };

    if (startDate || endDate) {
      where.createdAt = {};
      if (startDate) where.createdAt.gte = new Date(startDate);
      if (endDate) where.createdAt.lte = new Date(endDate);
    }

    // Get subscription history
    const [subscriptions, total] = await Promise.all([
      prisma.subscription.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip: (page - 1) * limit,
        take: limit
      }),
      prisma.subscription.count({ where })
    ]);

    // Get wallet transactions for billing history
    const walletTransactions = await prisma.walletTransaction.findMany({
      where: {
        wallet: {
          userId: session.user.id
        },
        type: { in: ['DEPOSIT', 'WITHDRAWAL', 'SUBSCRIPTION_PAYMENT'] }
      },
      include: {
        wallet: {
          select: {
            userId: true
          }
        }
      },
      orderBy: { createdAt: 'desc' },
      take: 50
    });

    // Get tip transactions
    const tipTransactions = await prisma.tip.findMany({
      where: {
        OR: [
          { senderId: session.user.id },
          { receiverId: session.user.id }
        ]
      },
      include: {
        sender: {
          select: {
            id: true,
            name: true,
            image: true
          }
        },
        receiver: {
          select: {
            id: true,
            name: true,
            image: true
          }
        }
      },
      orderBy: { createdAt: 'desc' },
      take: 50
    });

    // Combine and sort all transactions
    const allTransactions = [
      ...subscriptions.map(sub => ({
        id: sub.id,
        type: 'subscription',
        amount: sub.amount,
        currency: sub.currency,
        description: `Subscription: ${sub.planId}`,
        status: sub.status,
        createdAt: sub.createdAt,
        metadata: {
          planId: sub.planId,
          billingPeriod: sub.billingPeriod,
          startDate: sub.startDate,
          endDate: sub.endDate
        }
      })),
      ...walletTransactions.map(tx => ({
        id: tx.id,
        type: 'wallet',
        amount: tx.amount,
        currency: tx.currency,
        description: tx.description,
        status: tx.status,
        createdAt: tx.createdAt,
        metadata: {
          transactionType: tx.type,
          referenceId: tx.referenceId
        }
      })),
      ...tipTransactions.map(tip => ({
        id: tip.id,
        type: tip.senderId === session.user.id ? 'tip_sent' : 'tip_received',
        amount: tip.amount,
        currency: tip.currency,
        description: tip.senderId === session.user.id 
          ? `Tip sent to ${tip.receiver.name}`
          : `Tip received from ${tip.sender.name}`,
        status: tip.status,
        createdAt: tip.createdAt,
        metadata: {
          message: tip.message,
          isAnonymous: tip.isAnonymous,
          sender: tip.sender,
          receiver: tip.receiver
        }
      }))
    ].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

    // Calculate summary statistics
    const totalSpent = allTransactions
      .filter(tx => ['subscription', 'wallet', 'tip_sent'].includes(tx.type))
      .reduce((sum, tx) => sum + tx.amount, 0);

    const totalReceived = allTransactions
      .filter(tx => tx.type === 'tip_received')
      .reduce((sum, tx) => sum + tx.amount, 0);

    const activeSubscriptions = subscriptions.filter(sub => 
      ['ACTIVE', 'TRIALING'].includes(sub.status)
    ).length;

    return NextResponse.json({
      transactions: allTransactions.slice(0, limit),
      pagination: {
        page,
        limit,
        total: allTransactions.length,
        pages: Math.ceil(allTransactions.length / limit)
      },
      summary: {
        totalSpent,
        totalReceived,
        activeSubscriptions,
        totalTransactions: allTransactions.length
      },
      subscriptions,
      walletTransactions: walletTransactions.slice(0, 20),
      tipTransactions: tipTransactions.slice(0, 20)
    });

  } catch (error) {
    console.error('Error fetching billing history:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
