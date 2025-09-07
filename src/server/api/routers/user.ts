import { createTRPCRouter, protectedProcedure } from '@/server/api/trpc';
import { TRPCError } from '@trpc/server';
import { z } from 'zod';
import { getLogger } from '@/lib/logger';
import { Redis } from '@/lib/cache';
import { Prisma } from '@prisma/client';

const logger = getLogger('api-router');
const redis = Redis.getInstance();

// Input validation schemas
const createUserSchema = z.object({
  email: z.string().email(),
  name: z.string().min(2),
  role: z.enum(['USER', 'ADMIN']).default('USER'),
});

const updateUserSchema = z.object({
  id: z.string(),
  data: z.object({
    email: z.string().email().optional(),
    name: z.string().min(2).optional(),
    role: z.enum(['USER', 'ADMIN']).optional(),
  }),
});

const querySchema = z.object({
  limit: z.number().min(1).max(100).default(10),
  cursor: z.string().nullish(),
  search: z.string().optional(),
});

export const userRouter = createTRPCRouter({
  create: protectedProcedure
    .input(createUserSchema)
    .mutation(async ({ ctx, input }) => {
      try {
        // Check permissions
        if (!ctx.user.isAdmin) {
          throw new TRPCError({
            code: 'FORBIDDEN',
            message: 'Only admins can create users',
          });
        }

        // Create user
        const user = await ctx.prisma.user.create({
          data: input,
        });

        // Log action
        logger.info(
          { userId: user.id, action: 'user_created' },
          'User created successfully'
        );

        // Invalidate cache
        await redis.del('users:list');

        return user;
      } catch (error) {
        if (error instanceof Prisma.PrismaClientKnownRequestError) {
          if (error.code === 'P2002') {
            throw new TRPCError({
              code: 'CONFLICT',
              message: 'Email already exists',
            });
          }
        }
        throw error;
      }
    }),

  update: protectedProcedure
    .input(updateUserSchema)
    .mutation(async ({ ctx, input }) => {
      try {
        // Check permissions
        if (!ctx.user.isAdmin && ctx.user.id !== input.id) {
          throw new TRPCError({
            code: 'FORBIDDEN',
            message: 'Can only update own profile unless admin',
          });
        }

        // Update user
        const user = await ctx.prisma.user.update({
          where: { id: input.id },
          data: input.data,
        });

        // Log action
        logger.info(
          { userId: user.id, action: 'user_updated' },
          'User updated successfully'
        );

        // Invalidate cache
        await redis.del(`user:${user.id}`);
        await redis.del('users:list');

        return user;
      } catch (error) {
        if (error instanceof Prisma.PrismaClientKnownRequestError) {
          if (error.code === 'P2025') {
            throw new TRPCError({
              code: 'NOT_FOUND',
              message: 'User not found',
            });
          }
        }
        throw error;
      }
    }),

  list: protectedProcedure.input(querySchema).query(async ({ ctx, input }) => {
    try {
      const cacheKey = `users:list:${JSON.stringify(input)}`;

      // Try cache first
      const cached = await redis.get(cacheKey);
      if (cached) {
        return JSON.parse(cached);
      }

      // Build query
      const where: Prisma.UserWhereInput = {};
      if (input.search) {
        where.OR = [
          { name: { contains: input.search, mode: 'insensitive' } },
          { email: { contains: input.search, mode: 'insensitive' } },
        ];
      }

      // Execute query
      const users = await ctx.prisma.user.findMany({
        take: input.limit + 1,
        cursor: input.cursor ? { id: input.cursor } : undefined,
        where,
        orderBy: { createdAt: 'desc' },
        select: {
          id: true,
          name: true,
          email: true,
          role: true,
          createdAt: true,
        },
      });

      // Handle pagination
      let nextCursor: string | null = null;
      if (users.length > input.limit) {
        const nextItem = users.pop();
        nextCursor = nextItem!.id;
      }

      const result = {
        items: users,
        nextCursor,
      };

      // Cache results
      await redis.set(cacheKey, JSON.stringify(result), 'EX', 60);

      return result;
    } catch (error) {
      logger.error({ error }, 'Failed to list users');
      throw error;
    }
  }),

  getById: protectedProcedure
    .input(z.string())
    .query(async ({ ctx, input }) => {
      try {
        const cacheKey = `user:${input}`;

        // Try cache first
        const cached = await redis.get(cacheKey);
        if (cached) {
          return JSON.parse(cached);
        }

        const user = await ctx.prisma.user.findUniqueOrThrow({
          where: { id: input },
          include: {
            profile: true,
            posts: {
              take: 5,
              orderBy: { createdAt: 'desc' },
            },
          },
        });

        // Cache result
        await redis.set(cacheKey, JSON.stringify(user), 'EX', 300);

        return user;
      } catch (error) {
        if (error instanceof Prisma.PrismaClientKnownRequestError) {
          if (error.code === 'P2025') {
            throw new TRPCError({
              code: 'NOT_FOUND',
              message: 'User not found',
            });
          }
        }
        throw error;
      }
    }),

  delete: protectedProcedure
    .input(z.string())
    .mutation(async ({ ctx, input }) => {
      try {
        // Check permissions
        if (!ctx.user.isAdmin) {
          throw new TRPCError({
            code: 'FORBIDDEN',
            message: 'Only admins can delete users',
          });
        }

        await ctx.prisma.user.delete({
          where: { id: input },
        });

        // Log action
        logger.info(
          { userId: input, action: 'user_deleted' },
          'User deleted successfully'
        );

        // Invalidate cache
        await redis.del(`user:${input}`);
        await redis.del('users:list');

        return { success: true };
      } catch (error) {
        if (error instanceof Prisma.PrismaClientKnownRequestError) {
          if (error.code === 'P2025') {
            throw new TRPCError({
              code: 'NOT_FOUND',
              message: 'User not found',
            });
          }
        }
        throw error;
      }
    }),
});
