import { z } from 'zod';
import { enqueueRun, agentQueue } from '../../../../lib/queue/producer';
import { createTRPCRouter, protectedProcedure } from '../trpc';

export const agentRunRouter = createTRPCRouter({
  startRun: protectedProcedure
    .input(
      z.object({
        agentId: z.string(),
        params: z.record(z.any()).optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const { agentId, params } = input;
      const userId = ctx.session.user.id;

      // Create run record
      const run = await ctx.prisma.agentRun.create({
        data: {
          agentId,
          userId,
          status: 'PENDING',
        },
      });

      // Add job to centralized queue (idempotent: jobId maps to runId)
      await enqueueRun({
        runId: run.id,
        agentInstanceId: agentId,
        userId,
        input: params,
      });

      return run;
    }),

  getRun: protectedProcedure
    .input(
      z.object({
        runId: z.string(),
      })
    )
    .query(async ({ ctx, input }) => {
      const { runId } = input;
      const userId = ctx.session.user.id;

      const run = await ctx.prisma.agentRun.findUnique({
        where: { id: runId },
        include: {
          agent: true,
        },
      });

      if (!run) {
        throw new Error('Run not found');
      }

      if (run.userId !== userId) {
        throw new Error('Unauthorized');
      }

      return run;
    }),

  listRuns: protectedProcedure
    .input(
      z.object({
        agentId: z.string().optional(),
        status: z
          .enum([
            'PENDING',
            'RUNNING',
            'COMPLETED',
            'FAILED',
            'CANCELLED',
            'AWAITING_INPUT',
          ])
          .optional(),
        limit: z.number().min(1).max(100).default(20),
        cursor: z.string().nullish(),
      })
    )
    .query(async ({ ctx, input }) => {
      const { agentId, status, limit, cursor } = input;
      const userId = ctx.session.user.id;

      const runs = await ctx.prisma.agentRun.findMany({
        where: {
          userId,
          agentId: agentId,
          status: status,
        },
        take: limit + 1,
        cursor: cursor ? { id: cursor } : undefined,
        orderBy: {
          createdAt: 'desc',
        },
        include: {
          agent: true,
        },
      });

      let nextCursor: typeof cursor | undefined = undefined;
      if (runs.length > limit) {
        const nextItem = runs.pop();
        nextCursor = nextItem!.id;
      }

      return {
        runs,
        nextCursor,
      };
    }),

  cancelRun: protectedProcedure
    .input(
      z.object({
        runId: z.string(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const { runId } = input;
      const userId = ctx.session.user.id;

      const run = await ctx.prisma.agentRun.findUnique({
        where: { id: runId },
      });

      if (!run) {
        throw new Error('Run not found');
      }

      if (run.userId !== userId) {
        throw new Error('Unauthorized');
      }

      // Only allow cancelling pending or running jobs
      if (run.status !== 'PENDING' && run.status !== 'RUNNING') {
        throw new Error('Cannot cancel completed run');
      }

      // Remove from queue if pending
      if (run.status === 'PENDING') {
        await agentQueue.remove(runId);
      }

      // Update status
      const updatedRun = await ctx.prisma.agentRun.update({
        where: { id: runId },
        data: {
          status: 'CANCELLED',
          finishedAt: new Date(),
        },
      });

      return updatedRun;
    }),
});
