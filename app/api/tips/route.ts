import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { z } from 'zod';

const createTipSchema = z.object({
  receiverId: z.string().min(1),
  amount: z.number().min(0.01).max(1000),
  message: z.string().max(500).optional(),
  isAnonymous: z.boolean().default(false),
});

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const url = new URL(request.url);
    const type = url.searchParams.get('type') || 'all'; // 'sent', 'received', 'all'
    const page = parseInt(url.searchParams.get('page') || '1');
    const limit = parseInt(url.searchParams.get('limit') || '10');

    const where: any = {};
    
    if (type === 'sent') {
      where.senderId = session.user.id;
    } else if (type === 'received') {
      where.receiverId = session.user.id;
    } else {
      where.OR = [
        { senderId: session.user.id },
        { receiverId: session.user.id }
      ];
    }

    const [tips, total] = await Promise.all([
      prisma.tip.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip: (page - 1) * limit,
        take: limit,
        include: {
          sender: {
            select: { id: true, name: true, image: true }
          },
          receiver: {
            select: { id: true, name: true, image: true }
          }
        }
      }),
      prisma.tip.count({ where })
    ]);

    return NextResponse.json({
      tips,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    });

  } catch (error) {
    console.error('Error fetching tips:', error);
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
    const validatedData = createTipSchema.parse(body);

    // Check if user is trying to tip themselves
    if (validatedData.receiverId === session.user.id) {
      return NextResponse.json(
        { error: 'Cannot tip yourself' },
        { status: 400 }
      );
    }

    // Verify receiver exists
    const receiver = await prisma.user.findUnique({
      where: { id: validatedData.receiverId }
    });

    if (!receiver) {
      return NextResponse.json(
        { error: 'Receiver not found' },
        { status: 404 }
      );
    }

    // Get sender's wallet
    const senderWallet = await prisma.wallet.findUnique({
      where: { userId: session.user.id }
    });

    if (!senderWallet || senderWallet.balance < validatedData.amount) {
      return NextResponse.json(
        { error: 'Insufficient balance' },
        { status: 400 }
      );
    }

    // Create tip
    const tip = await prisma.tip.create({
      data: {
        ...validatedData,
        senderId: session.user.id,
        status: 'PENDING'
      },
      include: {
        sender: {
          select: { id: true, name: true, image: true }
        },
        receiver: {
          select: { id: true, name: true, image: true }
        }
      }
    });

    // Process the tip transaction
    await processTip(tip.id);

    return NextResponse.json(tip, { status: 201 });

  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Validation error', details: error.errors },
        { status: 400 }
      );
    }

    console.error('Error creating tip:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

async function processTip(tipId: string) {
  try {
    const tip = await prisma.tip.findUnique({
      where: { id: tipId },
      include: {
        sender: true,
        receiver: true
      }
    });

    if (!tip) return;

    // Get wallets
    const senderWallet = await prisma.wallet.findUnique({
      where: { userId: tip.senderId }
    });

    let receiverWallet = await prisma.wallet.findUnique({
      where: { userId: tip.receiverId }
    });

    // Create receiver wallet if it doesn't exist
    if (!receiverWallet) {
      receiverWallet = await prisma.wallet.create({
        data: {
          userId: tip.receiverId,
          balance: 0.0,
          currency: 'USD'
        }
      });
    }

    // Update balances
    await prisma.$transaction([
      // Deduct from sender
      prisma.wallet.update({
        where: { id: senderWallet!.id },
        data: { balance: senderWallet!.balance - tip.amount }
      }),
      // Add to receiver
      prisma.wallet.update({
        where: { id: receiverWallet.id },
        data: { balance: receiverWallet.balance + tip.amount }
      }),
      // Create transactions
      prisma.walletTransaction.create({
        data: {
          walletId: senderWallet!.id,
          type: 'TIP_SENT',
          amount: -tip.amount,
          currency: tip.currency,
          description: `Tip sent to ${tip.receiver.name}`,
          referenceId: tip.id,
          status: 'COMPLETED'
        }
      }),
      prisma.walletTransaction.create({
        data: {
          walletId: receiverWallet.id,
          type: 'TIP_RECEIVED',
          amount: tip.amount,
          currency: tip.currency,
          description: `Tip received from ${tip.isAnonymous ? 'Anonymous' : tip.sender.name}`,
          referenceId: tip.id,
          status: 'COMPLETED'
        }
      }),
      // Update tip status
      prisma.tip.update({
        where: { id: tipId },
        data: {
          status: 'COMPLETED',
          completedAt: new Date()
        }
      })
    ]);

    // Create notification for receiver
    await prisma.notification.create({
      data: {
        userId: tip.receiverId,
        type: 'tip',
        title: 'You received a tip!',
        message: `You received $${tip.amount} from ${tip.isAnonymous ? 'an anonymous user' : tip.sender.name}`,
        data: { tipId: tip.id, amount: tip.amount }
      }
    });

  } catch (error) {
    console.error('Error processing tip:', error);
    
    // Mark tip as failed
    await prisma.tip.update({
      where: { id: tipId },
      data: { status: 'FAILED' }
    });
  }
}
