# 🔌 API Documentation

## Overview
This document outlines our API endpoints, authentication, error handling, and best practices.

## Authentication

### Session-based Auth
```typescript
// Protected route example
export const protectedProcedure = t.procedure.use(isAuthed);

export const router = createTRPCRouter({
  getProfile: protectedProcedure.query(async ({ ctx }) => {
    const user = await prisma.user.findUnique({
      where: { id: ctx.user.id },
    });
    return user;
  }),
});
```

### OAuth Flow
```typescript
// pages/api/auth/[...nextauth].ts
export default NextAuth({
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    }),
    // Other providers...
  ],
  callbacks: {
    session: async ({ session, token }) => {
      if (session?.user) {
        session.user.id = token.sub;
      }
      return session;
    },
  },
});
```

## Endpoints

### Debug & Troubleshooting

#### System Health Monitor
```typescript
GET /api/debug/health
// Returns system health status for all services
// Requires: Admin role
```

#### API Request Debugger
```typescript
GET /api/debug/requests?limit=10&method=GET
POST /api/debug/requests
// View recent requests or test API endpoints
// Requires: Admin role
```

#### Database Query Tool
```typescript
GET /api/debug/database?model=User&limit=5
POST /api/debug/database
// Execute database queries and view model data
// Requires: Admin role
```

#### Error Log Viewer
```typescript
GET /api/debug/logs?level=error&limit=20
POST /api/debug/logs
// View and manage application logs
// Requires: Admin role
```

#### Performance Monitor
```typescript
GET /api/debug/performance
POST /api/debug/performance
// Monitor system performance metrics
// Requires: Admin role
```

#### Environment Checker
```typescript
GET /api/debug/env
// Verify environment variables and configuration
// Requires: Admin role
```

#### Database Schema Inspector
```typescript
GET /api/debug/schema?table=User&includeStats=true
// View database schema and relationships
// Requires: Admin role
```

#### Request Flow Tracer
```typescript
GET /api/debug/trace?requestId=req_123
POST /api/debug/trace
// Trace request flow through the system
// Requires: Admin role
```

#### API Testing Tool
```typescript
GET /api/debug/test?endpoint=/api/users
POST /api/debug/test
// Test API endpoints with custom parameters
// Requires: Admin role
```

### News & Content Curation

#### Get Personalized News Feed
```typescript
GET /api/news
Query Parameters:
- page: number (default: 1)
- limit: number (default: 20)
- category: string (optional)
- source: string (optional)
- featured: boolean (optional)
- trending: boolean (optional)
- sortBy: string (default: 'publishedAt')
- sortOrder: 'asc' | 'desc' (default: 'desc')

Response:
{
  "articles": [
    {
      "id": "string",
      "title": "string",
      "content": "string",
      "summary": "string",
      "url": "string",
      "imageUrl": "string",
      "author": "string",
      "publishedAt": "string",
      "category": "TECHNOLOGY",
      "tags": ["string"],
      "viewCount": 0,
      "likeCount": 0,
      "shareCount": 0,
      "isFeatured": false,
      "isTrending": false,
      "source": {
        "id": "string",
        "name": "string",
        "url": "string"
      },
      "userInteractions": {
        "isBookmarked": false,
        "isLiked": false,
        "isShared": false
      }
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 20,
    "total": 100,
    "pages": 5
  }
}
```

#### Get News Article Details
```typescript
GET /api/news/[id]

Response:
{
  "id": "string",
  "title": "string",
  "content": "string",
  "summary": "string",
  "url": "string",
  "imageUrl": "string",
  "author": "string",
  "publishedAt": "string",
  "category": "TECHNOLOGY",
  "tags": ["string"],
  "viewCount": 0,
  "likeCount": 0,
  "shareCount": 0,
  "isFeatured": false,
  "isTrending": false,
  "source": {
    "id": "string",
    "name": "string",
    "url": "string",
    "description": "string"
  },
  "userInteractions": {
    "isBookmarked": false,
    "isLiked": false,
    "isShared": false
  }
}
```

#### Interact with News Article
```typescript
POST /api/news/[id]/interact
Body:
{
  "type": "like" | "share" | "bookmark"
}

Response:
{
  "liked": true, // or "shared": true, or "bookmarked": true
  "message": "Article liked"
}
```

#### Get User News Preferences
```typescript
GET /api/news/preferences

Response:
{
  "id": "string",
  "categories": ["TECHNOLOGY", "AI_ML"],
  "sources": ["string"],
  "tags": ["string"],
  "keywords": ["string"],
  "isActive": true
}
```

#### Update User News Preferences
```typescript
PUT /api/news/preferences
Body:
{
  "categories": ["TECHNOLOGY", "AI_ML", "PROGRAMMING"],
  "sources": ["string"],
  "tags": ["string"],
  "keywords": ["string"]
}

Response:
{
  "id": "string",
  "categories": ["TECHNOLOGY", "AI_ML", "PROGRAMMING"],
  "sources": ["string"],
  "tags": ["string"],
  "keywords": ["string"],
  "isActive": true
}
```

#### Get AI-Powered Recommendations
```typescript
GET /api/news/recommendations
Query Parameters:
- limit: number (default: 10)
- algorithm: 'preferences' | 'trending' | 'similar' | 'hybrid' (default: 'hybrid')

Response:
{
  "recommendations": [
    {
      "id": "string",
      "title": "string",
      "content": "string",
      "summary": "string",
      "url": "string",
      "imageUrl": "string",
      "publishedAt": "string",
      "category": "TECHNOLOGY",
      "source": {
        "id": "string",
        "name": "string",
        "url": "string"
      },
      "userInteractions": {
        "isBookmarked": false,
        "isLiked": false,
        "isShared": false
      }
    }
  ],
  "algorithm": "hybrid",
  "total": 10
}
```

#### Get News Sources (Admin)
```typescript
GET /api/news/sources
Query Parameters:
- page: number (default: 1)
- limit: number (default: 20)
- category: string (optional)
- active: boolean (optional)
- type: 'RSS' | 'API' | 'MANUAL' | 'SCRAPED' (optional)
- search: string (optional)

Response:
{
  "sources": [
    {
      "id": "string",
      "name": "string",
      "url": "string",
      "description": "string",
      "type": "RSS",
      "isActive": true,
      "lastFetched": "string",
      "fetchInterval": 3600,
      "categories": ["TECHNOLOGY"],
      "tags": ["string"],
      "_count": {
        "articles": 100
      }
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 20,
    "total": 50,
    "pages": 3
  }
}
```

#### Create News Source (Admin)
```typescript
POST /api/news/sources
Body:
{
  "name": "string",
  "url": "string",
  "description": "string",
  "type": "RSS",
  "categories": ["TECHNOLOGY"],
  "tags": ["string"],
  "fetchInterval": 3600
}

Response:
{
  "id": "string",
  "name": "string",
  "url": "string",
  "description": "string",
  "type": "RSS",
  "isActive": true,
  "categories": ["TECHNOLOGY"],
  "tags": ["string"],
  "fetchInterval": 3600,
  "_count": {
    "articles": 0
  }
}
```

#### Content Curation (Admin)
```typescript
POST /api/news/curate
Body:
{
  "action": "feature" | "trending" | "archive" | "unfeature" | "untrending" | "unarchive",
  "articleIds": ["string"],
  "reason": "string" (optional)
}

Response:
{
  "message": "Successfully featured 5 articles",
  "updatedCount": 5,
  "articleIds": ["string"]
}
```

#### Get User Bookmarks
```typescript
GET /api/news/bookmarks
Query Parameters:
- page: number (default: 1)
- limit: number (default: 20)

Response:
{
  "bookmarks": [
    {
      "id": "string",
      "createdAt": "string",
      "article": {
        "id": "string",
        "title": "string",
        "content": "string",
        "summary": "string",
        "url": "string",
        "imageUrl": "string",
        "publishedAt": "string",
        "category": "TECHNOLOGY",
        "source": {
          "id": "string",
          "name": "string",
          "url": "string"
        },
        "userInteractions": {
          "isBookmarked": true,
          "isLiked": false,
          "isShared": false
        }
      }
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 20,
    "total": 50,
    "pages": 3
  }
}
```

### User Management

#### Get User Profile
```typescript
// router.user.ts
export const userRouter = createTRPCRouter({
  getProfile: protectedProcedure
    .input(z.object({
      userId: z.string().optional(),
    }))
    .query(async ({ ctx, input }) => {
      const userId = input.userId ?? ctx.user.id;
      
      return await prisma.user.findUnique({
        where: { id: userId },
        select: {
          id: true,
          name: true,
          email: true,
          profile: true,
        },
      });
    }),
});
```

#### Update Profile
```typescript
// router.user.ts
export const userRouter = createTRPCRouter({
  updateProfile: protectedProcedure
    .input(z.object({
      name: z.string().min(2).optional(),
      bio: z.string().max(500).optional(),
      avatar: z.string().url().optional(),
    }))
    .mutation(async ({ ctx, input }) => {
      return await prisma.user.update({
        where: { id: ctx.user.id },
        data: input,
      });
    }),
});
```

### Posts

#### Create Post
```typescript
// router.post.ts
export const postRouter = createTRPCRouter({
  create: protectedProcedure
    .input(z.object({
      title: z.string().min(1).max(100),
      content: z.string().min(1),
      tags: z.array(z.string()).optional(),
    }))
    .mutation(async ({ ctx, input }) => {
      return await prisma.post.create({
        data: {
          ...input,
          authorId: ctx.user.id,
        },
      });
    }),
});
```

#### Get Posts
```typescript
// router.post.ts
export const postRouter = createTRPCRouter({
  list: protectedProcedure
    .input(z.object({
      limit: z.number().min(1).max(100).default(10),
      cursor: z.string().optional(),
    }))
    .query(async ({ input }) => {
      const items = await prisma.post.findMany({
        take: input.limit + 1,
        cursor: input.cursor ? { id: input.cursor } : undefined,
        orderBy: { createdAt: 'desc' },
        include: {
          author: {
            select: {
              id: true,
              name: true,
            },
          },
        },
      });

      let nextCursor: typeof input.cursor | undefined = undefined;
      if (items.length > input.limit) {
        const nextItem = items.pop();
        nextCursor = nextItem?.id;
      }

      return {
        items,
        nextCursor,
      };
    }),
});
```

### Social Features

#### Follow User
```typescript
// router.social.ts
export const socialRouter = createTRPCRouter({
  follow: protectedProcedure
    .input(z.object({
      userId: z.string(),
    }))
    .mutation(async ({ ctx, input }) => {
      return await prisma.follows.create({
        data: {
          followerId: ctx.user.id,
          followingId: input.userId,
        },
      });
    }),
});
```

#### Get Activity Feed
```typescript
// router.social.ts
export const socialRouter = createTRPCRouter({
  feed: protectedProcedure
    .input(z.object({
      limit: z.number().min(1).max(100).default(10),
      cursor: z.string().optional(),
    }))
    .query(async ({ ctx, input }) => {
      const following = await prisma.follows.findMany({
        where: { followerId: ctx.user.id },
        select: { followingId: true },
      });

      return await prisma.post.findMany({
        where: {
          authorId: {
            in: following.map(f => f.followingId),
          },
        },
        take: input.limit,
        cursor: input.cursor ? { id: input.cursor } : undefined,
        orderBy: { createdAt: 'desc' },
        include: {
          author: {
            select: {
              id: true,
              name: true,
            },
          },
        },
      });
    }),
});
```

### Messaging

#### Send Message
```typescript
// router.message.ts
export const messageRouter = createTRPCRouter({
  send: protectedProcedure
    .input(z.object({
      recipientId: z.string(),
      content: z.string().min(1),
    }))
    .mutation(async ({ ctx, input }) => {
      return await prisma.message.create({
        data: {
          senderId: ctx.user.id,
          recipientId: input.recipientId,
          content: input.content,
        },
      });
    }),
});
```

### Search

#### Universal Search
```typescript
// router.search.ts
export const searchRouter = createTRPCRouter({
  search: protectedProcedure
    .input(z.object({
      query: z.string().min(1),
      type: z.enum(['user', 'post', 'all']).default('all'),
      limit: z.number().min(1).max(100).default(10),
    }))
    .query(async ({ input }) => {
      if (input.type === 'user' || input.type === 'all') {
        const users = await prisma.user.findMany({
          where: {
            OR: [
              { name: { contains: input.query, mode: 'insensitive' } },
              { email: { contains: input.query, mode: 'insensitive' } },
            ],
          },
          take: input.limit,
        });
      }

      if (input.type === 'post' || input.type === 'all') {
        const posts = await prisma.post.findMany({
          where: {
            OR: [
              { title: { contains: input.query, mode: 'insensitive' } },
              { content: { contains: input.query, mode: 'insensitive' } },
            ],
          },
          take: input.limit,
        });
      }

      return { users, posts };
    }),
});
```

## Error Handling

### Error Types
```typescript
// types/errors.ts
export enum ErrorCode {
  UNAUTHORIZED = 'UNAUTHORIZED',
  NOT_FOUND = 'NOT_FOUND',
  FORBIDDEN = 'FORBIDDEN',
  VALIDATION = 'VALIDATION',
  RATE_LIMIT = 'RATE_LIMIT',
  INTERNAL = 'INTERNAL',
}

export class AppError extends Error {
  constructor(
    public code: ErrorCode,
    message: string,
    public status: number = 500,
    public data?: any
  ) {
    super(message);
  }
}
```

### Error Handling Middleware
```typescript
// middleware/error.ts
export const errorHandler = (
  err: Error,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  if (err instanceof AppError) {
    return res.status(err.status).json({
      code: err.code,
      message: err.message,
      data: err.data,
    });
  }

  if (err instanceof ZodError) {
    return res.status(400).json({
      code: ErrorCode.VALIDATION,
      message: 'Validation failed',
      data: err.errors,
    });
  }

  console.error('Unhandled error:', err);
  return res.status(500).json({
    code: ErrorCode.INTERNAL,
    message: 'Internal server error',
  });
};
```

## Rate Limiting

### API Rate Limiting
```typescript
// middleware/rateLimit.ts
export const rateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  standardHeaders: true,
  legacyHeaders: false,
  handler: (req, res) => {
    throw new AppError(
      ErrorCode.RATE_LIMIT,
      'Too many requests',
      429
    );
  },
});
```

## Caching

### Response Caching
```typescript
// middleware/cache.ts
export const cacheMiddleware = (duration: number) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    const key = `cache:${req.url}`;
    const cached = await redis.get(key);

    if (cached) {
      return res.json(JSON.parse(cached));
    }

    res.sendResponse = res.json;
    res.json = (body) => {
      redis.set(key, JSON.stringify(body), 'EX', duration);
      return res.sendResponse(body);
    };

    next();
  };
};
```

## Validation

### Input Validation
```typescript
// schemas/user.ts
export const createUserSchema = z.object({
  email: z.string().email(),
  password: z
    .string()
    .min(8)
    .regex(/[A-Z]/)
    .regex(/[0-9]/)
    .regex(/[^A-Za-z0-9]/),
  name: z.string().min(2).max(50),
});

// Usage
const validateInput = <T>(schema: z.Schema<T>) => {
  return (req: Request, res: Response, next: NextFunction) => {
    try {
      req.body = schema.parse(req.body);
      next();
    } catch (error) {
      if (error instanceof ZodError) {
        throw new AppError(
          ErrorCode.VALIDATION,
          'Validation failed',
          400,
          error.errors
        );
      }
      throw error;
    }
  };
};
```

## Best Practices

### DO
- Use proper status codes
- Validate all inputs
- Handle all errors
- Use pagination
- Cache responses
- Rate limit requests
- Log API usage
- Document endpoints

### DON'T
- Expose sensitive data
- Skip input validation
- Return stack traces
- Use blocking operations
- Ignore performance
- Leave security holes

## Resources
- [TRPC Documentation](https://trpc.io/)
- [Next.js API Routes](https://nextjs.org/docs/api-routes/introduction)
- [Prisma Documentation](https://www.prisma.io/docs/)
- [NextAuth.js Documentation](https://next-auth.js.org/)
