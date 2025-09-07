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

    // Get or create wallet for user
    let wallet = await prisma.wallet.findUnique({
      where: { userId: session.user.id },
      include: {
        transactions: {
          orderBy: { createdAt: 'desc' },
          take: 10
        }
      }
    });

    if (!wallet) {
      wallet = await prisma.wallet.create({
        data: {
          userId: session.user.id,
          balance: 0.0,
          currency: 'USD'
        },
        include: {
          transactions: {
            orderBy: { createdAt: 'desc' },
            take: 10
          }
        }
      });
    }

    return NextResponse.json(wallet);

  } catch (error) {
    console.error('Error fetching wallet:', error);
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
    const { amount, type = 'DEPOSIT', description } = body;

    if (!amount || amount <= 0) {
      return NextResponse.json(
        { error: 'Invalid amount' },
        { status: 400 }
      );
    }

    // Get or create wallet
    let wallet = await prisma.wallet.findUnique({
      where: { userId: session.user.id }
    });

    if (!wallet) {
      wallet = await prisma.wallet.create({
        data: {
          userId: session.user.id,
          balance: 0.0,
          currency: 'USD'
        }
      });
    }

    // Create transaction
    const transaction = await prisma.walletTransaction.create({
      data: {
        walletId: wallet.id,
        type,
        amount,
        currency: 'USD',
        description: description || `${type} transaction`,
        status: 'COMPLETED'
      }
    });

    // Update wallet balance
    const newBalance = type === 'DEPOSIT' 
      ? wallet.balance + amount 
      : Math.max(0, wallet.balance - amount);

    await prisma.wallet.update({
      where: { id: wallet.id },
      data: { balance: newBalance }
    });

    return NextResponse.json({
      transaction,
      newBalance
    }, { status: 201 });

  } catch (error) {
    console.error('Error processing wallet transaction:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
