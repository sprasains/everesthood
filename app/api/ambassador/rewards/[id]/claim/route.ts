import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const rewardId = params.id;

    // Get ambassador profile
    const ambassador = await prisma.ambassadorProfile.findUnique({
      where: { userId: session.user.id }
    });

    if (!ambassador) {
      return NextResponse.json({ error: 'Ambassador profile not found' }, { status: 404 });
    }

    // Get reward
    const reward = await prisma.ambassadorReward.findFirst({
      where: {
        id: rewardId,
        ambassadorId: ambassador.id,
        status: 'PENDING'
      }
    });

    if (!reward) {
      return NextResponse.json({ error: 'Reward not found or already claimed' }, { status: 404 });
    }

    // Check if reward is expired
    if (reward.expiresAt && new Date() > reward.expiresAt) {
      await prisma.ambassadorReward.update({
        where: { id: rewardId },
        data: { status: 'EXPIRED' }
      });
      return NextResponse.json({ error: 'Reward has expired' }, { status: 400 });
    }

    // Claim reward
    const updatedReward = await prisma.ambassadorReward.update({
      where: { id: rewardId },
      data: {
        status: 'CLAIMED',
        claimedAt: new Date()
      }
    });

    // Add credits to wallet if it's a credits reward
    if (reward.type === 'CREDITS') {
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

      // Update wallet balance
      await prisma.wallet.update({
        where: { id: wallet.id },
        data: { balance: wallet.balance + reward.value }
      });

      // Create transaction record
      await prisma.walletTransaction.create({
        data: {
          walletId: wallet.id,
          type: 'DEPOSIT',
          amount: reward.value,
          currency: 'USD',
          description: `Ambassador reward: ${reward.title}`,
          referenceId: reward.id,
          status: 'COMPLETED'
        }
      });
    }

    // Create notification
    await prisma.notification.create({
      data: {
        userId: session.user.id,
        type: 'reward',
        title: 'Reward Claimed!',
        message: `You've successfully claimed your reward: ${reward.title}`,
        data: { rewardId: reward.id, value: reward.value }
      }
    });

    return NextResponse.json(updatedReward);

  } catch (error) {
    console.error('Error claiming reward:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

