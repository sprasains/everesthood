# 🎯 Feature Implementation Guide

## Table of Contents
1. [Authentication Features](#authentication-features)
2. [User Profile Features](#user-profile-features)
3. [Social Features](#social-features)
4. [Event Features](#event-features)
5. [News & Content Curation Features](#news--content-curation-features)
6. [Search Features](#search-features)
7. [Debug & Troubleshooting Features](#debug--troubleshooting-features)

## Authentication Features

### Social Login
```typescript
// pages/api/auth/[...nextauth].ts
import NextAuth from 'next-auth';
import GoogleProvider from 'next-auth/providers/google';

export const authOptions = {
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_ID!,
      clientSecret: process.env.GOOGLE_SECRET!,
    }),
  ],
  callbacks: {
    async session({ session, token }) {
      if (session?.user) {
        session.user.id = token.sub;
      }
      return session;
    },
  },
};

export default NextAuth(authOptions);
```

### Protected Routes
```typescript
// middleware.ts
import { withAuth } from 'next-auth/middleware';

export default withAuth({
  callbacks: {
    authorized: ({ token }) => !!token,
  },
});

export const config = {
  matcher: ['/dashboard/:path*', '/settings/:path*'],
};
```

## User Profile Features

### Profile Update
```typescript
// app/api/profile/route.ts
export async function PUT(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return new Response('Unauthorized', { status: 401 });
  }

  try {
    const body = await req.json();
    const updatedProfile = await prisma.user.update({
      where: { id: session.user.id },
      data: {
        name: body.name,
        bio: body.bio,
        // other fields
      },
    });

    return Response.json(updatedProfile);
  } catch (error) {
    return new Response('Error updating profile', { status: 500 });
  }
}
```

### Profile Image Upload
```typescript
export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return new Response('Unauthorized', { status: 401 });
  }

  try {
    const formData = await req.formData();
    const file = formData.get('file') as File;
    
    // Upload to storage (e.g., S3)
    const url = await uploadToStorage(file);
    
    // Update user profile
    const updated = await prisma.user.update({
      where: { id: session.user.id },
      data: { image: url },
    });

    return Response.json(updated);
  } catch (error) {
    return new Response('Error uploading image', { status: 500 });
  }
}
```

## Social Features

### Create Post
```typescript
// app/api/posts/route.ts
export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return new Response('Unauthorized', { status: 401 });
  }

  try {
    const { content, visibility } = await req.json();
    
    const post = await prisma.post.create({
      data: {
        content,
        visibility,
        authorId: session.user.id,
      },
      include: {
        author: {
          select: {
            name: true,
            image: true,
          },
        },
      },
    });

    // Notify followers
    await notifyFollowers(session.user.id, post.id);

    return Response.json(post);
  } catch (error) {
    return new Response('Error creating post', { status: 500 });
  }
}
```

### Like/Unlike Post
```typescript
// app/api/posts/[id]/like/route.ts
export async function POST(
  req: Request,
  { params }: { params: { id: string } }
) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return new Response('Unauthorized', { status: 401 });
  }

  try {
    const like = await prisma.like.create({
      data: {
        postId: params.id,
        userId: session.user.id,
      },
    });

    return Response.json(like);
  } catch (error) {
    return new Response('Error liking post', { status: 500 });
  }
}

export async function DELETE(
  req: Request,
  { params }: { params: { id: string } }
) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return new Response('Unauthorized', { status: 401 });
  }

  try {
    await prisma.like.delete({
      where: {
        postId_userId: {
          postId: params.id,
          userId: session.user.id,
        },
      },
    });

    return new Response(null, { status: 204 });
  } catch (error) {
    return new Response('Error unliking post', { status: 500 });
  }
}
```

## Event Features

### Create Event
```typescript
// app/api/events/route.ts
export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return new Response('Unauthorized', { status: 401 });
  }

  try {
    const body = await req.json();
    const event = await prisma.event.create({
      data: {
        title: body.title,
        description: body.description,
        startTime: new Date(body.startTime),
        endTime: new Date(body.endTime),
        location: body.location,
        organizerId: session.user.id,
        maxAttendees: body.maxAttendees,
      },
    });

    // Create initial RSVP for organizer
    await prisma.eventAttendee.create({
      data: {
        eventId: event.id,
        userId: session.user.id,
        status: 'GOING',
      },
    });

    return Response.json(event);
  } catch (error) {
    return new Response('Error creating event', { status: 500 });
  }
}
```

### RSVP to Event
```typescript
// app/api/events/[id]/rsvp/route.ts
export async function POST(
  req: Request,
  { params }: { params: { id: string } }
) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return new Response('Unauthorized', { status: 401 });
  }

  try {
    const { status } = await req.json();

    // Check if event is full
    const attendeeCount = await prisma.eventAttendee.count({
      where: {
        eventId: params.id,
        status: 'GOING',
      },
    });

    const event = await prisma.event.findUnique({
      where: { id: params.id },
    });

    if (
      attendeeCount >= (event?.maxAttendees ?? Infinity) &&
      status === 'GOING'
    ) {
      return new Response('Event is full', { status: 400 });
    }

    // Update or create RSVP
    const rsvp = await prisma.eventAttendee.upsert({
      where: {
        eventId_userId: {
          eventId: params.id,
          userId: session.user.id,
        },
      },
      update: { status },
      create: {
        eventId: params.id,
        userId: session.user.id,
        status,
      },
    });

    return Response.json(rsvp);
  } catch (error) {
    return new Response('Error updating RSVP', { status: 500 });
  }
}
```

## News & Content Curation Features

### Get Personalized News Feed
```typescript
// app/api/news/route.ts
export async function GET(request: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const page = parseInt(searchParams.get('page') || '1');
  const limit = parseInt(searchParams.get('limit') || '20');
  const category = searchParams.get('category') || '';

  // Get user preferences
  const userPreferences = await prisma.userNewsPreference.findUnique({
    where: { userId: session.user.id }
  });

  // Build where clause based on user preferences
  const where: any = {
    status: 'PUBLISHED'
  };

  if (category) {
    where.category = category;
  } else if (userPreferences?.categories.length) {
    where.category = { in: userPreferences.categories };
  }

  const articles = await prisma.newsArticle.findMany({
    where,
    include: {
      source: {
        select: { id: true, name: true, url: true }
      },
      _count: {
        select: { interactions: true, bookmarks: true }
      }
    },
    orderBy: { publishedAt: 'desc' },
    skip: (page - 1) * limit,
    take: limit
  });

  return NextResponse.json({ articles });
}
```

### Interact with News Article
```typescript
// app/api/news/[id]/interact/route.ts
export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const body = await request.json();
  const { type } = z.object({
    type: z.enum(['like', 'share', 'bookmark']),
  }).parse(body);

  if (type === 'bookmark') {
    // Handle bookmark toggle
    const existingBookmark = await prisma.newsBookmark.findUnique({
      where: {
        articleId_userId: {
          articleId: params.id,
          userId: session.user.id
        }
      }
    });

    if (existingBookmark) {
      await prisma.newsBookmark.delete({
        where: {
          articleId_userId: {
            articleId: params.id,
            userId: session.user.id
          }
        }
      });
      return NextResponse.json({ bookmarked: false });
    } else {
      await prisma.newsBookmark.create({
        data: {
          articleId: params.id,
          userId: session.user.id
        }
      });
      return NextResponse.json({ bookmarked: true });
    }
  }

  // Handle like/share interactions
  const existingInteraction = await prisma.newsInteraction.findUnique({
    where: {
      articleId_userId_type: {
        articleId: params.id,
        userId: session.user.id,
        type: type
      }
    }
  });

  if (existingInteraction) {
    await prisma.newsInteraction.delete({
      where: {
        articleId_userId_type: {
          articleId: params.id,
          userId: session.user.id,
          type: type
        }
      }
    });
    return NextResponse.json({ [type]: false });
  } else {
    await prisma.newsInteraction.create({
      data: {
        articleId: params.id,
        userId: session.user.id,
        type: type
      }
    });
    return NextResponse.json({ [type]: true });
  }
}
```

### Manage User News Preferences
```typescript
// app/api/news/preferences/route.ts
export async function PUT(request: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const body = await request.json();
  const validatedData = z.object({
    categories: z.array(z.string()).optional(),
    sources: z.array(z.string()).optional(),
    tags: z.array(z.string()).optional(),
    keywords: z.array(z.string()).optional(),
  }).parse(body);

  const preferences = await prisma.userNewsPreference.upsert({
    where: { userId: session.user.id },
    update: validatedData,
    create: {
      userId: session.user.id,
      categories: validatedData.categories || ['TECHNOLOGY', 'AI_ML'],
      sources: validatedData.sources || [],
      tags: validatedData.tags || [],
      keywords: validatedData.keywords || []
    }
  });

  return NextResponse.json(preferences);
}
```

### Get AI-Powered Recommendations
```typescript
// app/api/news/recommendations/route.ts
export async function GET(request: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const algorithm = searchParams.get('algorithm') || 'hybrid';

  // Get user preferences and interaction history
  const [userPreferences, userInteractions] = await Promise.all([
    prisma.userNewsPreference.findUnique({
      where: { userId: session.user.id }
    }),
    prisma.newsInteraction.findMany({
      where: { userId: session.user.id },
      include: { article: { include: { source: true } } },
      orderBy: { createdAt: 'desc' },
      take: 100
    })
  ]);

  let recommendations: any[] = [];

  switch (algorithm) {
    case 'preferences':
      recommendations = await getPreferenceBasedRecommendations(userPreferences, 10);
      break;
    case 'trending':
      recommendations = await getTrendingRecommendations(10);
      break;
    case 'similar':
      recommendations = await getSimilarContentRecommendations(userInteractions, 10);
      break;
    case 'hybrid':
    default:
      recommendations = await getHybridRecommendations(userPreferences, userInteractions, 10);
      break;
  }

  return NextResponse.json({ recommendations, algorithm });
}
```

### Admin Content Curation
```typescript
// app/api/news/curate/route.ts
export async function POST(request: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  // Check admin permissions
  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { role: true }
  });

  if (user?.role !== 'ADMIN' && user?.role !== 'SUPER_ADMIN') {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  const body = await request.json();
  const { action, articleIds, reason } = z.object({
    action: z.enum(['feature', 'trending', 'archive', 'unfeature', 'untrending', 'unarchive']),
    articleIds: z.array(z.string()).min(1),
    reason: z.string().optional(),
  }).parse(body);

  let updateData: any = {};
  switch (action) {
    case 'feature':
      updateData = { isFeatured: true };
      break;
    case 'unfeature':
      updateData = { isFeatured: false };
      break;
    case 'trending':
      updateData = { isTrending: true };
      break;
    case 'untrending':
      updateData = { isTrending: false };
      break;
    case 'archive':
      updateData = { status: 'ARCHIVED' };
      break;
    case 'unarchive':
      updateData = { status: 'PUBLISHED' };
      break;
  }

  const result = await prisma.newsArticle.updateMany({
    where: { id: { in: articleIds } },
    data: updateData
  });

  return NextResponse.json({
    message: `Successfully ${action}ed ${result.count} articles`,
    updatedCount: result.count
  });
}
```

Each feature implementation includes:
- API route implementation
- Error handling
- Type safety
- Authentication checks
- Database operations
- Input validation with Zod
- User preference management
- Content curation tools
- AI-powered recommendations

## Debug & Troubleshooting Features

### System Health Monitoring
```typescript
// app/api/debug/health/route.ts
export async function GET(req: NextRequest) {
  const health = {
    services: {
      database: await checkDatabase(),
      redis: await checkRedis(),
      queue: await checkQueue(),
      storage: await checkStorage(),
    },
    system: {
      memory: process.memoryUsage(),
      uptime: process.uptime(),
      version: process.version,
    }
  };
  return NextResponse.json(health);
}
```

### API Request Debugger
```typescript
// app/api/debug/requests/route.ts
export async function POST(req: NextRequest) {
  const { method, url, headers, body } = await req.json();
  
  const response = await fetch(url, {
    method,
    headers: { 'Content-Type': 'application/json', ...headers },
    body: body ? JSON.stringify(body) : undefined
  });
  
  return NextResponse.json({
    request: { method, url, headers, body },
    response: {
      status: response.status,
      headers: Object.fromEntries(response.headers.entries()),
      data: await response.json()
    }
  });
}
```

### Database Query Tool
```typescript
// app/api/debug/database/route.ts
export async function POST(req: NextRequest) {
  const { query, params } = await req.json();
  
  const result = await prisma.$queryRawUnsafe(query, ...params);
  
  return NextResponse.json({ result, query, params });
}
```

### Error Log Viewer
```typescript
// app/api/debug/logs/route.ts
export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const level = searchParams.get('level') || 'error';
  const limit = parseInt(searchParams.get('limit') || '100');
  
  const logs = await getLogs(level, limit);
  return NextResponse.json({ logs, level, limit });
}
```

### Performance Monitor
```typescript
// app/api/debug/performance/route.ts
export async function GET(req: NextRequest) {
  const performance = {
    memory: process.memoryUsage(),
    cpu: process.cpuUsage(),
    system: {
      platform: process.platform,
      arch: process.arch,
      uptime: process.uptime()
    },
    requests: {
      total: global.requestCount || 0,
      errors: global.errorCount || 0,
      averageResponseTime: global.averageResponseTime || 0
    }
  };
  
  return NextResponse.json(performance);
}
```

### Environment Variables Checker
```typescript
// app/api/debug/env/route.ts
export async function GET(req: NextRequest) {
  const envVars = {
    DATABASE_URL: process.env.DATABASE_URL ? '✅ Set' : '❌ Missing',
    NEXTAUTH_SECRET: process.env.NEXTAUTH_SECRET ? '✅ Set' : '❌ Missing',
    REDIS_URL: process.env.REDIS_URL ? '✅ Set' : '❌ Missing',
    // ... other environment variables
  };
  
  return NextResponse.json({ environment: envVars });
}
```

### Debug Panel Frontend
```typescript
// app/debug/page.tsx
export default function DebugPage() {
  const [health, setHealth] = useState(null);
  const [logs, setLogs] = useState([]);
  
  const loadHealthData = async () => {
    const response = await fetch('/api/debug/health');
    const data = await response.json();
    setHealth(data);
  };
  
  return (
    <Container maxWidth="lg">
      <Tabs value={tabValue}>
        <Tab label="System Health" />
        <Tab label="Error Logs" />
        <Tab label="API Requests" />
        <Tab label="Database" />
        <Tab label="Environment" />
      </Tabs>
      {/* Tab content */}
    </Container>
  );
}
```

### Key Features
- **Real-time Health Monitoring**: Database, Redis, queue, and storage status
- **API Request/Response Debugging**: Test endpoints and view request history
- **Database Query Tool**: Execute custom queries and view model data
- **Error Log Viewer**: Filter and analyze application logs
- **Performance Metrics**: Memory, CPU, and request performance monitoring
- **Environment Validation**: Check configuration and environment variables
- **Interactive Debug Panel**: Web-based interface for all debugging tools
- **Request Flow Tracing**: End-to-end request flow analysis
- **Schema Inspector**: Database structure and relationship analysis
- **API Testing Tool**: Test endpoints with custom parameters

### Security Features
- **Admin-only Access**: All debug endpoints require admin privileges
- **Sensitive Data Masking**: Passwords and secrets are masked in responses
- **Production Restrictions**: Some features are limited in production
- **Rate Limiting**: Debug endpoints are rate limited to prevent abuse
- **Audit Logging**: All debug actions are logged for security

### Usage Examples
```bash
# Start with debug mode
npm run debug

# Check system health
npm run debug:health

# View real-time logs
npm run debug:logs

# Open debug panel
npm run debug:panel

# Test API endpoint
curl -X POST http://localhost:3000/api/debug/test \
  -H "Content-Type: application/json" \
  -d '{"method":"GET","url":"http://localhost:3000/api/users"}'
```

### Documentation
- **Complete Guide**: [docs/DEBUGGING.md](./DEBUGGING.md)
- **API Reference**: [docs/API.md](./API.md)
- **Troubleshooting**: Common scenarios and solutions
- **Emergency Procedures**: Step-by-step recovery processes
