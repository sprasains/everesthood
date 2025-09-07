import { z } from 'zod';
import { createTRPCRouter, protectedProcedure, publicProcedure } from '../trpc';

// Validation schemas
export const agentSchema = z.object({
  id: z.string(),
  name: z.string().min(3, 'Name must be at least 3 characters'),
  description: z.string().min(10, 'Description must be at least 10 characters'),
  tags: z.array(z.string()),
  category: z.string(),
  rating: z.number().min(0).max(5),
  usageCount: z.number().int().min(0),
  userCount: z.number().int().min(0),
  createdAt: z.date(),
  updatedAt: z.date(),
  createdById: z.string(),
  isPublic: z.boolean(),
});

export const createAgentSchema = agentSchema.omit({
  id: true,
  rating: true,
  usageCount: true,
  userCount: true,
  createdAt: true,
  updatedAt: true,
  createdById: true,
});

export const agentRunSchema = z.object({
  id: z.string(),
  agentId: z.string(),
  status: z.enum(['pending', 'running', 'completed', 'failed', 'cancelled']),
  startTime: z.date(),
  endTime: z.date().optional(),
  duration: z.number().optional(),
  cost: z.number(),
  error: z.string().optional(),
  results: z.any(),
  metadata: z.record(z.any()).optional(),
});

// PARITY: implements ai.agents.templates; see PARITY_REPORT.md#ai-agents-templates
// TODO: Add template versioning, improve queue error handling, add template search

export const agentRouter = createTRPCRouter({
  // Get trending agents
  getTrending: publicProcedure
    .input(
      z.object({
        limit: z.number().min(1).max(50).default(10),
        category: z.string().optional(),
        tags: z.array(z.string()).optional(),
        minRating: z.number().min(0).max(5).optional(),
      })
    )
    .query(async ({ ctx, input }) => {
      const agents = await ctx.prisma.agent.findMany({
        where: {
          isPublic: true,
          ...(input.category ? { category: input.category } : {}),
          ...(input.tags?.length ? { tags: { hasEvery: input.tags } } : {}),
          ...(input.minRating ? { rating: { gte: input.minRating } } : {}),
        },
        orderBy: [{ usageCount: 'desc' }, { rating: 'desc' }],
        take: input.limit,
        include: {
          createdBy: {
            select: {
              id: true,
              name: true,
              image: true,
            },
          },
        },
      });

      return agents;
    }),

  // Create new agent
  create: protectedProcedure
    .input(createAgentSchema)
    .mutation(async ({ ctx, input }) => {
      const agent = await ctx.prisma.agent.create({
        data: {
          ...input,
          createdById: ctx.session.user.id,
          rating: 0,
          usageCount: 0,
          userCount: 0,
        },
      });

      return agent;
    }),

  // Get agent runs
  getRuns: protectedProcedure
    .input(
      z.object({
        agentId: z.string(),
        limit: z.number().min(1).max(100).default(50),
        offset: z.number().min(0).default(0),
        status: z
          .array(
            z.enum(['pending', 'running', 'completed', 'failed', 'cancelled'])
          )
          .optional(),
      })
    )
    .query(async ({ ctx, input }) => {
      const runs = await ctx.prisma.agentRun.findMany({
        where: {
          agentId: input.agentId,
          ...(input.status ? { status: { in: input.status } } : {}),
        },
        orderBy: { startTime: 'desc' },
        skip: input.offset,
        take: input.limit,
      });

      const total = await ctx.prisma.agentRun.count({
        where: {
          agentId: input.agentId,
          ...(input.status ? { status: { in: input.status } } : {}),
        },
      });

      return { runs, total };
    }),

  // Start new agent run
  startRun: protectedProcedure
    .input(
      z.object({
        agentId: z.string(),
        metadata: z.record(z.any()).optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      // Start transaction to ensure atomic updates
      return await ctx.prisma.$transaction(async (prisma) => {
        // Create the run
        const run = await prisma.agentRun.create({
          data: {
            agentId: input.agentId,
            status: 'pending',
            startTime: new Date(),
            cost: 0,
            metadata: input.metadata,
            userId: ctx.session.user.id,
          },
        });

        // Update agent usage stats
        await prisma.agent.update({
          where: { id: input.agentId },
          data: {
            usageCount: { increment: 1 },
            userCount: {
              increment:
                (await prisma.agentRun.count({
                  where: {
                    agentId: input.agentId,
                    userId: ctx.session.user.id,
                  },
                })) === 1
                  ? 1
                  : 0,
            },
          },
        });

        // Queue the run in the job system
        await ctx.queue.add('agent-run', {
          runId: run.id,
          agentId: input.agentId,
          userId: ctx.session.user.id,
        });

        return run;
      });
    }),

  // Search agents
  search: publicProcedure
    .input(
      z.object({
        query: z.string(),
        categories: z.array(z.string()).optional(),
        tags: z.array(z.string()).optional(),
        minRating: z.number().min(0).max(5).optional(),
        limit: z.number().min(1).max(50).default(20),
        offset: z.number().min(0).default(0),
      })
    )
    .query(async ({ ctx, input }) => {
      const agents = await ctx.prisma.agent.findMany({
        where: {
          isPublic: true,
          OR: [
            { name: { contains: input.query, mode: 'insensitive' } },
            { description: { contains: input.query, mode: 'insensitive' } },
            { tags: { hasSome: [input.query] } },
          ],
          ...(input.categories?.length
            ? { category: { in: input.categories } }
            : {}),
          ...(input.tags?.length ? { tags: { hasEvery: input.tags } } : {}),
          ...(input.minRating ? { rating: { gte: input.minRating } } : {}),
        },
        orderBy: [{ rating: 'desc' }, { usageCount: 'desc' }],
        skip: input.offset,
        take: input.limit,
        include: {
          createdBy: {
            select: {
              id: true,
              name: true,
              image: true,
            },
          },
        },
      });

      const total = await ctx.prisma.agent.count({
        where: {
          isPublic: true,
          OR: [
            { name: { contains: input.query, mode: 'insensitive' } },
            { description: { contains: input.query, mode: 'insensitive' } },
            { tags: { hasSome: [input.query] } },
          ],
          ...(input.categories?.length
            ? { category: { in: input.categories } }
            : {}),
          ...(input.tags?.length ? { tags: { hasEvery: input.tags } } : {}),
          ...(input.minRating ? { rating: { gte: input.minRating } } : {}),
        },
      });

      return { agents, total };
    }),
});
