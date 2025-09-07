import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { z } from 'zod';

const updateSubscriptionSchema = z.object({
  status: z.enum(['ACTIVE', 'CANCELLED', 'PAST_DUE', 'UNPAID']).optional(),
  planId: z.string().optional(),
  billingPeriod: z.enum(['MONTHLY', 'YEARLY']).optional(),
});

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const subscriptionId = params.id;

    const subscription = await prisma.subscription.findUnique({
      where: { id: subscriptionId },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true
          }
        }
      }
    });

    if (!subscription) {
      return NextResponse.json({ error: 'Subscription not found' }, { status: 404 });
    }

    // Check if user owns this subscription
    if (subscription.userId !== session.user.id) {
      return NextResponse.json({ error: 'Not authorized to view this subscription' }, { status: 403 });
    }

    return NextResponse.json(subscription);

  } catch (error) {
    console.error('Error fetching subscription:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const subscriptionId = params.id;
    const body = await request.json();
    const validatedData = updateSubscriptionSchema.parse(body);

    // Check if subscription exists and user owns it
    const existingSubscription = await prisma.subscription.findUnique({
      where: { id: subscriptionId },
      select: { userId: true, status: true }
    });

    if (!existingSubscription) {
      return NextResponse.json({ error: 'Subscription not found' }, { status: 404 });
    }

    if (existingSubscription.userId !== session.user.id) {
      return NextResponse.json({ error: 'Not authorized to modify this subscription' }, { status: 403 });
    }

    // Update subscription
    const updatedSubscription = await prisma.subscription.update({
      where: { id: subscriptionId },
      data: {
        ...validatedData,
        updatedAt: new Date()
      }
    });

    // Create notification for status changes
    if (validatedData.status && validatedData.status !== existingSubscription.status) {
      let notificationMessage = '';
      switch (validatedData.status) {
        case 'CANCELLED':
          notificationMessage = 'Your subscription has been cancelled. You will retain access until the end of your billing period.';
          break;
        case 'PAST_DUE':
          notificationMessage = 'Your subscription payment is past due. Please update your payment method.';
          break;
        case 'UNPAID':
          notificationMessage = 'Your subscription payment failed. Please update your payment method to restore access.';
          break;
        case 'ACTIVE':
          notificationMessage = 'Your subscription has been reactivated successfully.';
          break;
      }

      if (notificationMessage) {
        await prisma.notification.create({
          data: {
            userId: session.user.id,
            type: 'subscription',
            title: 'Subscription Status Updated',
            message: notificationMessage,
            data: { 
              subscriptionId: subscriptionId,
              newStatus: validatedData.status,
              oldStatus: existingSubscription.status
            }
          }
        });
      }
    }

    return NextResponse.json(updatedSubscription);

  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Validation error', details: error.errors },
        { status: 400 }
      );
    }

    console.error('Error updating subscription:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const subscriptionId = params.id;

    // Check if subscription exists and user owns it
    const existingSubscription = await prisma.subscription.findUnique({
      where: { id: subscriptionId },
      select: { userId: true, status: true }
    });

    if (!existingSubscription) {
      return NextResponse.json({ error: 'Subscription not found' }, { status: 404 });
    }

    if (existingSubscription.userId !== session.user.id) {
      return NextResponse.json({ error: 'Not authorized to cancel this subscription' }, { status: 403 });
    }

    // Cancel subscription (soft delete by updating status)
    const cancelledSubscription = await prisma.subscription.update({
      where: { id: subscriptionId },
      data: { 
        status: 'CANCELLED',
        updatedAt: new Date()
      }
    });

    // Create notification
    await prisma.notification.create({
      data: {
        userId: session.user.id,
        type: 'subscription',
        title: 'Subscription Cancelled',
        message: 'Your subscription has been cancelled. You will retain access until the end of your billing period.',
        data: { 
          subscriptionId: subscriptionId,
          cancelledAt: new Date().toISOString()
        }
      }
    });

    return NextResponse.json({ 
      message: 'Subscription cancelled successfully',
      subscription: cancelledSubscription
    });

  } catch (error) {
    console.error('Error cancelling subscription:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
