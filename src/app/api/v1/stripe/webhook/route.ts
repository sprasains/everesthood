import { NextRequest, NextResponse } from "next/server"
import { headers } from "next/headers"
import { stripe } from "@/lib/stripe"
import { prisma } from "@/lib/prisma"

export async function POST(request: NextRequest) {
  try {
    const body = await request.text()
    const signature = headers().get('stripe-signature')

    if (!signature) {
      return NextResponse.json(
        { error: 'Missing stripe signature' },
        { status: 400 }
      )
    }

    let event
    try {
      event = stripe.webhooks.constructEvent(
        body,
        signature,
        process.env.STRIPE_WEBHOOK_SECRET!
      )
    } catch (error) {
      console.error('Webhook signature verification failed:', error)
      return NextResponse.json(
        { error: 'Invalid signature' },
        { status: 400 }
      )
    }

    switch (event.type) {
      case 'checkout.session.completed':
        const session = event.data.object
        console.log('Payment completed:', session)

        // Update user subscription status
        if (session.customer_email) {
          await prisma.user.update({
            where: { email: session.customer_email },
            data: {
              subscriptionStatus: 'premium',
              stripeCustomerId: session.customer as string,
            }
          })
        }
        break

      case 'customer.subscription.deleted':
        const subscription = event.data.object
        console.log('Subscription cancelled:', subscription)

        // Update user subscription status
        await prisma.user.update({
          where: { stripeCustomerId: subscription.customer as string },
          data: {
            subscriptionStatus: 'free',
          }
        })
        break

      case 'invoice.payment_failed':
        const invoice = event.data.object
        console.log('Payment failed:', invoice)

        // Handle failed payment (e.g., send email notification)
        break

      default:
        console.log(`Unhandled event type: ${event.type}`)
    }

    return NextResponse.json({ received: true })
  } catch (error) {
    console.error('Webhook error:', error)
    return NextResponse.json(
      { error: 'Webhook handler failed' },
      { status: 500 }
    )
  }
}