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

    const contentId = params.id;

    // Get content details
    const content = await prisma.exclusiveContent.findUnique({
      where: { 
        id: contentId,
        isPublished: true,
        deletedAt: null
      },
      include: {
        author: {
          select: {
            id: true,
            name: true
          }
        }
      }
    });

    if (!content) {
      return NextResponse.json({ error: 'Content not found' }, { status: 404 });
    }

    // Check if user already has access
    const existingAccess = await prisma.contentAccess.findUnique({
      where: {
        userId_contentId: {
          userId: session.user.id,
          contentId: contentId
        }
      }
    });

    if (existingAccess && existingAccess.isActive) {
      return NextResponse.json({ error: 'You already have access to this content' }, { status: 400 });
    }

    // Check if content is free
    if (content.tier === 'FREE') {
      // Grant free access
      const access = await prisma.contentAccess.create({
        data: {
          userId: session.user.id,
          contentId: contentId,
          accessType: 'FREE'
        }
      });

      return NextResponse.json({
        message: 'Access granted',
        access
      });
    }

    // Check if user is the author
    if (content.authorId === session.user.id) {
      return NextResponse.json({ error: 'You cannot purchase your own content' }, { status: 400 });
    }

    // Get user's wallet
    const wallet = await prisma.wallet.findUnique({
      where: { userId: session.user.id }
    });

    if (!wallet || wallet.balance < content.price) {
      return NextResponse.json({ error: 'Insufficient balance' }, { status: 400 });
    }

    // Process purchase
    await prisma.$transaction(async (tx) => {
      // Deduct from buyer's wallet
      await tx.wallet.update({
        where: { id: wallet.id },
        data: { balance: wallet.balance - content.price }
      });

      // Create transaction record for buyer
      await tx.walletTransaction.create({
        data: {
          walletId: wallet.id,
          type: 'WITHDRAWAL',
          amount: -content.price,
          currency: content.currency,
          description: `Purchase: ${content.title}`,
          referenceId: contentId,
          status: 'COMPLETED'
        }
      });

      // Add to author's wallet (if they have one)
      const authorWallet = await tx.wallet.findUnique({
        where: { userId: content.authorId }
      });

      if (authorWallet) {
        await tx.wallet.update({
          where: { id: authorWallet.id },
          data: { balance: authorWallet.balance + content.price }
        });

        // Create transaction record for author
        await tx.walletTransaction.create({
          data: {
            walletId: authorWallet.id,
            type: 'DEPOSIT',
            amount: content.price,
            currency: content.currency,
            description: `Sale: ${content.title}`,
            referenceId: contentId,
            status: 'COMPLETED'
          }
        });
      }

      // Grant access to content
      await tx.contentAccess.create({
        data: {
          userId: session.user.id,
          contentId: contentId,
          accessType: 'PURCHASED'
        }
      });
    });

    // Create notification for author
    await prisma.notification.create({
      data: {
        userId: content.authorId,
        type: 'sale',
        title: 'Content Sold!',
        message: `${session.user.name} purchased your content: ${content.title}`,
        data: { 
          contentId: content.id, 
          buyerId: session.user.id,
          amount: content.price 
        }
      }
    });

    return NextResponse.json({
      message: 'Purchase successful',
      content: {
        id: content.id,
        title: content.title,
        price: content.price
      }
    });

  } catch (error) {
    console.error('Error purchasing content:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

