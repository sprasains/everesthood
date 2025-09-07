import { z } from 'zod';
import { TRPCError } from '@trpc/server';

export function validateInput<T>(schema: z.ZodType<T>, data: unknown): T {
  try {
    return schema.parse(data);
  } catch (error) {
    if (error instanceof z.ZodError) {
      throw new TRPCError({
        code: 'BAD_REQUEST',
        message: error.errors[0]?.message || 'Invalid input',
      });
    }
    throw error;
  }
}

// Common validation schemas
export const paginationSchema = z.object({
  page: z.number().min(1).default(1),
  limit: z.number().min(1).max(100).default(20),
});

export const idSchema = z.string().min(1);

export const dateRangeSchema = z.object({
  startDate: z.string().datetime(),
  endDate: z.string().datetime(),
});

export const searchSchema = z.object({
  query: z.string().min(1),
  filters: z.record(z.any()).optional(),
  sort: z.enum(['asc', 'desc']).optional(),
  sortBy: z.string().optional(),
});

// Agent validation schemas
export const agentConfigSchema = z.object({
  name: z.string().min(1).max(100),
  description: z.string().min(1),
  prompt: z.string().min(1),
  tools: z.record(z.any()).optional(),
  isPublic: z.boolean().default(false),
  category: z.string().optional(),
});

export const agentRunSchema = z.object({
  agentId: z.string().min(1),
  params: z.record(z.any()).optional(),
});

// Billing validation schemas
export const subscriptionSchema = z.object({
  priceId: z.string().min(1),
  paymentMethodId: z.string().min(1),
});

export const usageReportSchema = z.object({
  userId: z.string().min(1),
  type: z.enum(['daily', 'weekly', 'monthly']),
  ...dateRangeSchema.shape,
});
