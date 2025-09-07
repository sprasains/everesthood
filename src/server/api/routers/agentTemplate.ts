import { z } from 'zod';
import { createTRPCRouter, protectedProcedure, publicProcedure } from '../trpc';
import { AgentRunError } from '@/lib/errors';

export const agentRouter = createTRPCRouter({
  search: publicProcedure
    .input(
      z.object({
        query: z.string().min(1),
        category: z.string().optional(),
        page: z.number().min(1).default(1),
        limit: z.number().min(1).max(50).default(20),
        sortBy: z.enum(['relevance', 'newest', 'popular']).default('relevance'),
      })
    )
    .query(async ({ ctx, input }) => {
      const { query, category, page, limit, sortBy } = input;
      const skip = (page - 1) * limit;

      // Build the base query
      const whereClause = {
        OR: [
          { name: { contains: query, mode: 'insensitive' } },
          { description: { contains: query, mode: 'insensitive' } },
        ],
        isPublic: true,
        deletedAt: null,
        ...(category && { category }),
      };

      // Get total count for pagination
      const total = await ctx.prisma.agentTemplate.count({
        where: whereClause,
      });

      // Build sort options
      const orderBy =
        sortBy === 'newest'
          ? { createdAt: 'desc' as const }
          : sortBy === 'popular'
          ? { instances: { _count: 'desc' as const } }
          : { _relevance: { fields: ['name', 'description'], search: query } };

      // Execute search with sorting and pagination
      const templates = await ctx.prisma.agentTemplate.findMany({
        where: whereClause,
        orderBy,
        skip,
        take: limit,
        include: {
          _count: {
            select: { instances: true },
          },
          versions: {
            orderBy: { version: 'desc' },
            take: 1,
            select: {
              version: true,
              createdAt: true,
            },
          },
        },
      });

      return {
        templates,
        pagination: {
          total,
          pages: Math.ceil(total / limit),
          page,
          limit,
        },
      };
    }),

  createVersion: protectedProcedure
    .input(
      z.object({
        templateId: z.string(),
        config: z.record(z.any()),
        prompt: z.string(),
        tools: z.record(z.any()).optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const { templateId, config, prompt, tools } = input;

      // Start a transaction
      return ctx.prisma.$transaction(async (tx) => {
        // Get current template
        const template = await tx.agentTemplate.findUniqueOrThrow({
          where: { id: templateId },
          include: {
            versions: {
              orderBy: { version: 'desc' },
              take: 1,
            },
          },
        });

        // Calculate new version number
        const newVersion = template.versions[0]?.version + 1 || 1;

        // Create new version
        const version = await tx.agentTemplateVersion.create({
          data: {
            templateId,
            version: newVersion,
            config,
            prompt,
            tools,
          },
        });

        // Update template with new version
        await tx.agentTemplate.update({
          where: { id: templateId },
          data: {
            version: newVersion,
            prompt,
            tools,
            updatedAt: new Date(),
          },
        });

        return version;
      });
    }),

  getVersionHistory: protectedProcedure
    .input(
      z.object({
        templateId: z.string(),
        limit: z.number().min(1).max(50).default(10),
        cursor: z.number().optional(),
      })
    )
    .query(async ({ ctx, input }) => {
      const { templateId, limit, cursor } = input;

      const versions = await ctx.prisma.agentTemplateVersion.findMany({
        where: { templateId },
        orderBy: { version: 'desc' },
        take: limit + 1,
        skip: cursor ? 1 : 0,
        cursor: cursor
          ? { templateId_version: { templateId, version: cursor } }
          : undefined,
      });

      let nextCursor: typeof cursor | undefined = undefined;
      if (versions.length > limit) {
        const nextItem = versions.pop()!;
        nextCursor = nextItem.version;
      }

      return {
        versions,
        nextCursor,
      };
    }),

  // Add template version navigation
  getVersion: protectedProcedure
    .input(
      z.object({
        templateId: z.string(),
        version: z.number(),
      })
    )
    .query(async ({ ctx, input }) => {
      const { templateId, version } = input;

      return ctx.prisma.agentTemplateVersion.findUnique({
        where: {
          templateId_version: {
            templateId,
            version,
          },
        },
      });
    }),
});

export type SearchResults = Awaited<
  ReturnType<(typeof agentRouter)['_def']['procedures']['search']['query']>
>;
