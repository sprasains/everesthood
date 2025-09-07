// PARITY: implements billing.metered.usage; see PARITY_REPORT.md#billing-metered-usage
// TODO: Complete webhook handling, add usage reporting

import { z } from 'zod';
import { createTRPCRouter, protectedProcedure } from '../trpc';
import Stripe from 'stripe';
import { env } from '@/env.mjs';

const stripe = new Stripe(env.STRIPE_SECRET_KEY, {
  apiVersion: '2023-10-16',
});

export const billingRouter = createTRPCRouter({
  getUsage: protectedProcedure
    .input(
      z.object({
        userId: z.string(),
      })
    )
    .query(async ({ ctx, input }) => {
      const { userId } = input;

      const usage = await ctx.prisma.billing.findMany({
        where: {
          userId,
          createdAt: {
            gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000), // Last 30 days
          },
        },
        orderBy: {
          createdAt: 'asc',
        },
        select: {
          createdAt: true,
          currentUsage: true,
        },
      });

      return usage.map((record) => ({
        timestamp: record.createdAt,
        usage: record.currentUsage,
      }));
    }),

  getSubscription: protectedProcedure
    .input(
      z.object({
        userId: z.string(),
      })
    )
    .query(async ({ ctx, input }) => {
      const { userId } = input;

      const billing = await ctx.prisma.billing.findUnique({
        where: { userId },
      });

      if (!billing?.stripeSubscriptionId) {
        return null;
      }

      const subscription = await stripe.subscriptions.retrieve(
        billing.stripeSubscriptionId
      );

      return {
        id: subscription.id,
        status: subscription.status,
        currentPeriodEnd: new Date(subscription.current_period_end * 1000),
        cancelAtPeriodEnd: subscription.cancel_at_period_end,
      };
    }),

  createSubscription: protectedProcedure
    .input(
      z.object({
        userId: z.string(),
        paymentMethodId: z.string(),
        priceId: z.string(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const { userId, paymentMethodId, priceId } = input;

      try {
        // Get or create customer
        let billing = await ctx.prisma.billing.findUnique({
          where: { userId },
        });

        if (!billing?.stripeCustomerId) {
          const user = await ctx.prisma.user.findUnique({
            where: { id: userId },
          });

          if (!user) {
            throw new Error('User not found');
          }

          const customer = await stripe.customers.create({
            email: user.email,
            payment_method: paymentMethodId,
            invoice_settings: {
              default_payment_method: paymentMethodId,
            },
          });

          billing = await ctx.prisma.billing.create({
            data: {
              userId,
              stripeCustomerId: customer.id,
            },
          });
        }

        // Create subscription
        const subscription = await stripe.subscriptions.create({
          customer: billing.stripeCustomerId,
          items: [{ price: priceId }],
          payment_behavior: 'default_incomplete',
          payment_settings: {
            payment_method_types: ['card'],
            save_default_payment_method: 'on_subscription',
          },
          expand: ['latest_invoice.payment_intent'],
        });

        // Update billing record
        await ctx.prisma.billing.update({
          where: { userId },
          data: {
            stripeSubscriptionId: subscription.id,
            status: subscription.status,
          },
        });

        return {
          subscriptionId: subscription.id,
          clientSecret: (subscription.latest_invoice as any)?.payment_intent
            ?.client_secret,
        };
      } catch (error) {
        console.error('Error creating subscription:', error);
        throw new Error('Failed to create subscription');
      }
    }),

  cancelSubscription: protectedProcedure
    .input(
      z.object({
        userId: z.string(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const { userId } = input;

      const billing = await ctx.prisma.billing.findUnique({
        where: { userId },
      });

      if (!billing?.stripeSubscriptionId) {
        throw new Error('No active subscription found');
      }

      await stripe.subscriptions.update(billing.stripeSubscriptionId, {
        cancel_at_period_end: true,
      });

      await ctx.prisma.billing.update({
        where: { userId },
        data: {
          cancelAtPeriodEnd: true,
        },
      });

      return { success: true };
    }),
});
