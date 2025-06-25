import { NextRequest, NextResponse } from "next/server";
import { headers } from "next/headers";
import Stripe from "stripe";
import { stripe } from "@/lib/stripe";
import { prisma } from "@/lib/prisma";

export async function POST(req: NextRequest) {
  const body = await req.text();
  const signature = headers().get("Stripe-Signature") as string;
  let event: Stripe.Event;

  try {
    event = stripe.webhooks.constructEvent(body, signature, process.env.STRIPE_WEBHOOK_SECRET!);
  } catch (err: any) {
    return new NextResponse(`Webhook Error: ${err.message}`, { status: 400 });
  }

  const session = event.data.object as Stripe.Checkout.Session;
  
  // Handle the checkout.session.completed event
  if (event.type === "checkout.session.completed") {
    // Handle spotlight purchase
    if (session.metadata?.purchaseType === 'spotlight') {
      const weekFromNow = new Date();
      weekFromNow.setDate(weekFromNow.getDate() + 7);
      await prisma.user.update({
        where: { id: session.metadata.userId },
        data: { profileSpotlightEndsAt: weekFromNow }
      });
      return new NextResponse(null, { status: 200 });
    }
    const subscription = await stripe.subscriptions.retrieve(session.subscription as string);
    const customerId = session.customer as string;

    await prisma.user.update({
      where: { stripeCustomerId: customerId },
      data: {
        stripeSubscriptionId: subscription.id,
        stripePriceId: subscription.items.data[0].price.id,
        stripeCurrentPeriodEnd: new Date(subscription.current_period_end * 1000),
        subscriptionTier: "PREMIUM", // Or logic to determine tier from priceId
      },
    });
  }

  // Handle subscription renewals
  if (event.type === "invoice.payment_succeeded") {
    const subscription = await stripe.subscriptions.retrieve(session.subscription as string);
     await prisma.user.update({
      where: { stripeSubscriptionId: subscription.id },
      data: {
        stripePriceId: subscription.items.data[0].price.id,
        stripeCurrentPeriodEnd: new Date(subscription.current_period_end * 1000),
      },
    });
  }
  
  // Handle subscription cancellations
   if (event.type === "customer.subscription.deleted") {
    const subscription = event.data.object as Stripe.Subscription;
    await prisma.user.update({
      where: { stripeSubscriptionId: subscription.id },
      data: {
        subscriptionTier: 'FREE',
        stripeCurrentPeriodEnd: null,
      },
    });
  }

  return new NextResponse(null, { status: 200 });
}
