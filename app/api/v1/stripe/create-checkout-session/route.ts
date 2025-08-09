import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { stripe } from '@/lib/stripe';

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user || !session.user.id) {
      return new NextResponse('Unauthorized', { status: 401 });
    }

    const userId = session.user.id;
    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user) return new NextResponse('User not found', { status: 404 });

    // Ensure Stripe customer
    let stripeCustomerId = user.stripeCustomerId || undefined;
    if (!stripeCustomerId) {
      const customer = await stripe.customers.create({
        email: user.email || undefined,
        name: user.name || undefined,
        metadata: { userId },
      });
      stripeCustomerId = customer.id;
      await prisma.user.update({ where: { id: userId }, data: { stripeCustomerId } });
    }

    const body = await req.json().catch(() => ({}));
    const priceId = body?.priceId || process.env.STRIPE_PREMIUM_PRICE_ID || process.env.NEXT_PUBLIC_STRIPE_PREMIUM_PRICE_ID;
    const successUrl = body?.successUrl || `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/dashboard?upgraded=true`;
    const cancelUrl = body?.cancelUrl || `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/subscribe`;

    if (!priceId) {
      return NextResponse.json({ message: 'Missing Stripe price ID' }, { status: 400 });
    }

    const checkout = await stripe.checkout.sessions.create({
      mode: 'subscription',
      customer: stripeCustomerId,
      client_reference_id: userId,
      line_items: [{ price: priceId, quantity: 1 }],
      success_url: successUrl,
      cancel_url: cancelUrl,
      allow_promotion_codes: true,
      subscription_data: {
        metadata: { userId },
      },
    });

    return NextResponse.json({ url: checkout.url }, { status: 200 });
  } catch (error) {
    console.error('Error creating checkout session:', error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
}

