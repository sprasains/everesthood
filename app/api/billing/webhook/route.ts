import { NextRequest } from 'next/server';
import Stripe from 'stripe';
import { prisma } from '../../../../prisma';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, { apiVersion: '2023-10-16' });

// POST /api/billing/webhook - Stripe webhook handler
export async function POST(req: NextRequest) {
  const sig = req.headers.get('stripe-signature');
  const buf = await req.arrayBuffer();
  let event;
  try {
    event = stripe.webhooks.constructEvent(Buffer.from(buf), sig!, process.env.STRIPE_WEBHOOK_SECRET!);
  } catch (err) {
    return new Response('Webhook Error: ' + err.message, { status: 400 });
  }
  // Handle usage/invoice events
  if (event.type === 'invoice.paid' || event.type === 'invoice.payment_succeeded') {
    const invoice = event.data.object;
    await prisma.invoice.upsert({
      where: { stripeInvoiceId: invoice.id },
      update: { status: 'PAID', paidAt: new Date() },
      create: {
        stripeInvoiceId: invoice.id,
        status: 'PAID',
        amount: invoice.amount_paid / 100,
        currency: invoice.currency,
        issuedAt: new Date(invoice.created * 1000),
        paidAt: new Date(),
        billingAccountId: invoice.customer, // map to BillingAccount
      },
    });
  }
  // Add more event types as needed
  return new Response('Webhook received', { status: 200 });
}
