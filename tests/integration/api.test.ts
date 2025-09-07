import { describe, expect, it, beforeAll, afterAll } from 'vitest';
import { createTRPCContext } from '@/server/api/trpc';
import { appRouter } from '@/server/api/root';
import { prisma } from '@/server/db';
import { type inferProcedureInput } from '@trpc/server';
import { type AppRouter } from '@/server/api/root';
import { Redis } from '@/lib/cache';

describe('API Integration Tests', () => {
  const redis = Redis.getInstance();

  // Test data
  let userId: string;
  let postId: string;
  let commentId: string;

  // Create test context
  const createContext = () => {
    return createTRPCContext({
      session: {
        user: {
          id: userId,
          email: 'test@example.com',
          role: 'USER',
          isAdmin: false,
        },
        expires: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
      },
    });
  };

  // Create caller
  const caller = appRouter.createCaller(createContext());

  beforeAll(async () => {
    // Create test user
    const user = await prisma.user.create({
      data: {
        email: 'test@example.com',
        name: 'Test User',
        role: 'USER',
      },
    });
    userId = user.id;
  });

  afterAll(async () => {
    // Cleanup test data
    await prisma.comment.deleteMany({ where: { authorId: userId } });
    await prisma.post.deleteMany({ where: { authorId: userId } });
    await prisma.user.delete({ where: { id: userId } });
    await redis.flushall();
  });

  // Post API Tests
  describe('post.create', () => {
    it('creates post successfully', async () => {
      type Input = inferProcedureInput<AppRouter['post']['create']>;
      const input: Input = {
        title: 'Test Post',
        content: 'Test Content',
      };

      const post = await caller.post.create(input);
      postId = post.id;

      expect(post).toMatchObject({
        title: input.title,
        content: input.content,
        authorId: userId,
      });
    });

    it('validates input', async () => {
      type Input = inferProcedureInput<AppRouter['post']['create']>;
      const input: Input = {
        title: '', // Invalid: empty title
        content: 'Test Content',
      };

      await expect(caller.post.create(input)).rejects.toThrow();
    });
  });

  describe('post.list', () => {
    it('returns paginated posts', async () => {
      type Input = inferProcedureInput<AppRouter['post']['list']>;
      const input: Input = {
        limit: 10,
        cursor: null,
      };

      const result = await caller.post.list(input);
      expect(result.items).toBeInstanceOf(Array);
      expect(result.items.length).toBeLessThanOrEqual(input.limit);
    });

    it('handles cursor-based pagination', async () => {
      type Input = inferProcedureInput<AppRouter['post']['list']>;
      const firstPage = await caller.post.list({ limit: 1 });
      const secondPage = await caller.post.list({
        limit: 1,
        cursor: firstPage.nextCursor,
      });

      expect(firstPage.items[0].id).not.toBe(secondPage.items[0]?.id);
    });
  });

  // Comment API Tests
  describe('comment.create', () => {
    it('creates comment successfully', async () => {
      type Input = inferProcedureInput<AppRouter['comment']['create']>;
      const input: Input = {
        postId,
        content: 'Test Comment',
      };

      const comment = await caller.comment.create(input);
      commentId = comment.id;

      expect(comment).toMatchObject({
        content: input.content,
        postId: input.postId,
        authorId: userId,
      });
    });
  });

  describe('comment.list', () => {
    it('returns comments for post', async () => {
      type Input = inferProcedureInput<AppRouter['comment']['list']>;
      const input: Input = {
        postId,
        limit: 10,
        cursor: null,
      };

      const result = await caller.comment.list(input);
      expect(result.items).toBeInstanceOf(Array);
      expect(result.items.some((c) => c.id === commentId)).toBe(true);
    });
  });

  // Like API Tests
  describe('like.toggle', () => {
    it('toggles like status', async () => {
      type Input = inferProcedureInput<AppRouter['like']['toggle']>;
      const input: Input = { postId };

      // Like
      const liked = await caller.like.toggle(input);
      expect(liked).toBe(true);

      // Unlike
      const unliked = await caller.like.toggle(input);
      expect(unliked).toBe(false);
    });
  });

  // Search API Tests
  describe('search.query', () => {
    it('returns search results', async () => {
      type Input = inferProcedureInput<AppRouter['search']['query']>;
      const input: Input = {
        query: 'test',
        limit: 10,
      };

      const results = await caller.search.query(input);
      expect(results).toMatchObject({
        posts: expect.any(Array),
        users: expect.any(Array),
        total: expect.any(Number),
      });
    });
  });

  // User API Tests
  describe('user.profile', () => {
    it('returns user profile', async () => {
      const profile = await caller.user.profile({ userId });
      expect(profile).toMatchObject({
        id: userId,
        email: 'test@example.com',
        name: 'Test User',
      });
    });

    it('includes user stats', async () => {
      const profile = await caller.user.profile({ userId });
      expect(profile).toHaveProperty('stats');
      expect(profile.stats).toMatchObject({
        posts: expect.any(Number),
        followers: expect.any(Number),
        following: expect.any(Number),
      });
    });
  });

  // Event API Tests
  describe('event.create', () => {
    it('creates event successfully', async () => {
      type Input = inferProcedureInput<AppRouter['event']['create']>;
      const input: Input = {
        title: 'Test Event',
        description: 'Test Description',
        startDate: new Date(Date.now() + 24 * 60 * 60 * 1000),
        location: 'Test Location',
      };

      const event = await caller.event.create(input);
      expect(event).toMatchObject({
        title: input.title,
        description: input.description,
        location: input.location,
        organizerId: userId,
      });
    });
  });

  // RSVP API Tests
  describe('event.rsvp', () => {
    it('handles RSVP status changes', async () => {
      type Input = inferProcedureInput<AppRouter['event']['rsvp']>;
      const input: Input = {
        eventId: 'test-event-id',
        status: 'GOING',
      };

      const rsvp = await caller.event.rsvp(input);
      expect(rsvp).toMatchObject({
        status: input.status,
        userId,
        eventId: input.eventId,
      });
    });
  });

  // Cache Tests
  describe('caching behavior', () => {
    it('caches and invalidates user profile', async () => {
      // First call - should hit database
      const start1 = Date.now();
      await caller.user.profile({ userId });
      const duration1 = Date.now() - start1;

      // Second call - should hit cache
      const start2 = Date.now();
      await caller.user.profile({ userId });
      const duration2 = Date.now() - start2;

      expect(duration2).toBeLessThan(duration1);

      // Update user - should invalidate cache
      await caller.user.update({
        id: userId,
        data: { name: 'Updated Name' },
      });

      // Third call - should hit database again
      const start3 = Date.now();
      const updated = await caller.user.profile({ userId });
      const duration3 = Date.now() - start3;

      expect(duration3).toBeGreaterThan(duration2);
      expect(updated.name).toBe('Updated Name');
    });
  });

  // Rate Limiting Tests
  describe('rate limiting', () => {
    it('enforces rate limits', async () => {
      const promises = Array(100)
        .fill(null)
        .map(() =>
          caller.post.create({
            title: 'Test Post',
            content: 'Test Content',
          })
        );

      await expect(Promise.all(promises)).rejects.toThrow('Too many requests');
    });
  });

  // Error Handling Tests
  describe('error handling', () => {
    it('handles not found errors', async () => {
      await expect(caller.post.get({ id: 'nonexistent-id' })).rejects.toThrow(
        'Not found'
      );
    });

    it('handles validation errors', async () => {
      await expect(
        caller.post.create({
          title: 'a'.repeat(300), // Too long
          content: '',
        })
      ).rejects.toThrow('Validation error');
    });

    it('handles permission errors', async () => {
      // Try to delete another user's post
      await expect(
        caller.post.delete({ id: 'another-user-post-id' })
      ).rejects.toThrow('FORBIDDEN');
    });
  });
});
