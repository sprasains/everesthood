# 🔧 Advanced Troubleshooting Guide

## Common Issues and Solutions

### 1. Queue Processing Issues

#### Symptoms
- Jobs stuck in "waiting" state
- High job failure rate
- DLQ filling up quickly

#### Diagnosis Steps
```typescript
// Check queue health
const health = await queueHealth.check();
console.log('Queue metrics:', health.metrics);

// Inspect failed jobs
const failed = await dlqQueue.getFailed();
console.log('Failed jobs:', failed.map(j => ({
  id: j.id,
  failedReason: j.failedReason,
  stacktrace: j.stacktrace
})));
```

#### Solutions
1. Check Redis connection:
```typescript
const redis = new Redis({
  host: process.env.REDIS_HOST,
  port: parseInt(process.env.REDIS_PORT),
  password: process.env.REDIS_PASSWORD,
  retryStrategy: (times) => Math.min(times * 50, 2000)
});

// Test connection
await redis.ping();
```

2. Implement retry with backoff:
```typescript
export const createQueue = (name: string) => {
  return new Queue(name, {
    defaultJobOptions: {
      attempts: 3,
      backoff: {
        type: 'exponential',
        delay: 1000
      }
    }
  });
};
```

### 2. Authentication Flow Issues

#### Symptoms
- Infinite auth redirects
- Session not persisting
- CSRF token mismatch

#### Diagnosis
```typescript
// Debug session
export const debugSession = async (req: NextApiRequest) => {
  const session = await getSession({ req });
  console.log({
    session,
    cookies: req.cookies,
    headers: req.headers
  });
};

// Test auth flow
export const validateAuthFlow = async () => {
  const providers = await getProviders();
  const csrfToken = await getCsrfToken();
  return { providers, csrfToken };
};
```

#### Solutions
1. Clear session state:
```typescript
export const clearAuthState = async () => {
  await signOut({ redirect: false });
  cookies().delete('next-auth.session-token');
  cookies().delete('__Secure-next-auth.session-token');
};
```

2. Implement auth debugging middleware:
```typescript
export function withAuthDebug(handler: NextApiHandler) {
  return async (req: NextApiRequest, res: NextApiResponse) => {
    console.log('Auth Debug:', {
      session: await getSession({ req }),
      headers: req.headers,
      cookies: req.cookies
    });
    return handler(req, res);
  };
}
```

### 3. Cache Inconsistency

#### Symptoms
- Stale data being served
- Cache miss rate too high
- Inconsistent data across users

#### Diagnosis
```typescript
// Cache monitoring
export const monitorCache = async (key: string) => {
  const stats = await redis.info('stats');
  const ttl = await redis.ttl(key);
  const size = await redis.memory('usage', key);
  
  return { stats, ttl, size };
};

// Cache validation
export const validateCache = async (key: string, sourceData: any) => {
  const cached = await redis.get(key);
  return {
    isCached: Boolean(cached),
    isValid: JSON.stringify(cached) === JSON.stringify(sourceData)
  };
};
```

#### Solutions
1. Implement cache warming:
```typescript
export const warmCache = async () => {
  const keys = ['posts:trending', 'users:active', 'events:upcoming'];
  
  for (const key of keys) {
    const data = await fetchFreshData(key);
    await redis.set(key, JSON.stringify(data), 'EX', 3600);
  }
};
```

2. Add cache debugging:
```typescript
export const debugCache = async (key: string) => {
  const operations = await redis.monitor();
  
  operations.on('monitor', (time, args) => {
    console.log('Cache operation:', {
      time: new Date(time * 1000),
      command: args[0],
      key: args[1],
      value: args[2]
    });
  });
};
```

### 4. Database Connection Issues

#### Symptoms
- Connection timeouts
- Pool exhaustion
- Deadlocks

#### Diagnosis
```typescript
// Connection pool monitoring
export const monitorConnections = async () => {
  const metrics = await prisma.$queryRaw`
    SELECT * FROM pg_stat_activity 
    WHERE datname = current_database();
  `;
  
  return metrics;
};

// Query performance tracking
export const trackQueryPerformance = async (query: string) => {
  const start = performance.now();
  const result = await prisma.$queryRaw`EXPLAIN ANALYZE ${query}`;
  const duration = performance.now() - start;
  
  return { result, duration };
};
```

#### Solutions
1. Implement connection pooling:
```typescript
import { PrismaClient } from '@prisma/client';

const prismaClientSingleton = () => {
  return new PrismaClient({
    log: ['query', 'info', 'warn', 'error'],
    datasources: {
      db: {
        url: process.env.DATABASE_URL
      }
    },
    pool: {
      min: 2,
      max: 10
    }
  });
};

export const prisma = globalThis.prisma ?? prismaClientSingleton();
```

2. Add query timeout and retry:
```typescript
export async function withQueryRetry<T>(
  operation: () => Promise<T>,
  maxAttempts = 3
): Promise<T> {
  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    try {
      return await Promise.race([
        operation(),
        new Promise((_, reject) => 
          setTimeout(() => reject(new Error('Query timeout')), 5000)
        )
      ]);
    } catch (error) {
      if (attempt === maxAttempts) throw error;
      await new Promise(r => setTimeout(r, attempt * 1000));
    }
  }
  throw new Error('Query failed after max attempts');
}
```

### 5. Memory Leaks and Performance Issues

#### Symptoms
- Increasing memory usage
- Slow response times
- CPU spikes

#### Diagnosis
```typescript
// Memory usage tracking
export const trackMemoryUsage = () => {
  const usage = process.memoryUsage();
  return {
    heapUsed: usage.heapUsed / 1024 / 1024,
    heapTotal: usage.heapTotal / 1024 / 1024,
    external: usage.external / 1024 / 1024,
    rss: usage.rss / 1024 / 1024
  };
};

// Performance monitoring
export const monitorPerformance = async (route: string) => {
  const start = performance.now();
  const response = await fetch(route);
  const end = performance.now();
  
  return {
    duration: end - start,
    status: response.status,
    size: response.headers.get('content-length'),
    type: response.headers.get('content-type')
  };
};
```

#### Solutions
1. Implement memory limits:
```typescript
export const configureMemoryLimits = () => {
  const limit = 1024; // MB
  v8.setFlagsFromString(`--max_old_space_size=${limit}`);
  
  process.on('warning', (warning) => {
    if (warning.name === 'HeapSizeExceededError') {
      console.error('Memory limit exceeded, restarting...');
      process.exit(1);
    }
  });
};
```

2. Add performance monitoring:
```typescript
export function withPerformanceTracking(handler: NextApiHandler) {
  return async (req: NextApiRequest, res: NextApiResponse) => {
    const start = performance.now();
    
    try {
      await handler(req, res);
    } finally {
      const duration = performance.now() - start;
      console.log(`[${req.method}] ${req.url}: ${duration}ms`);
      
      // Record metrics
      await prisma.requestMetric.create({
        data: {
          route: req.url!,
          method: req.method!,
          duration,
          status: res.statusCode,
          timestamp: new Date()
        }
      });
    }
  };
}
```

## Advanced Debugging Techniques

### 1. Distributed Tracing
```typescript
import { trace } from '@opentelemetry/api';

export async function withTracing<T>(
  name: string,
  operation: () => Promise<T>
): Promise<T> {
  const tracer = trace.getTracer('app');
  
  return await tracer.startActiveSpan(name, async (span) => {
    try {
      const result = await operation();
      span.end();
      return result;
    } catch (error) {
      span.recordException(error as Error);
      span.setStatus({ code: SpanStatusCode.ERROR });
      span.end();
      throw error;
    }
  });
}
```

### 2. Request/Response Logging
```typescript
export function withRequestLogging(handler: NextApiHandler) {
  return async (req: NextApiRequest, res: NextApiResponse) => {
    const requestId = crypto.randomUUID();
    const startTime = Date.now();
    
    console.log({
      type: 'request',
      id: requestId,
      method: req.method,
      url: req.url,
      headers: req.headers,
      query: req.query,
      body: req.body
    });
    
    try {
      await handler(req, res);
    } finally {
      console.log({
        type: 'response',
        id: requestId,
        duration: Date.now() - startTime,
        status: res.statusCode,
        headers: res.getHeaders()
      });
    }
  };
}
```

### 3. Error Boundary Pattern
```typescript
'use client';

export class ErrorBoundary extends React.Component<
  { children: React.ReactNode },
  { hasError: boolean; error?: Error }
> {
  constructor(props: { children: React.ReactNode }) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error) {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('Error boundary caught error:', error, errorInfo);
    
    // Report to error tracking service
    captureError(error, {
      context: errorInfo,
      severity: 'error',
      source: 'client'
    });
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="error-boundary">
          <h2>Something went wrong</h2>
          <details>
            <summary>Error details</summary>
            <pre>{this.state.error?.message}</pre>
          </details>
          <button onClick={() => this.setState({ hasError: false })}>
            Try again
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}
```

### 4. Database Query Analysis
```typescript
export async function analyzeQuery(query: string) {
  const analysis = await prisma.$queryRaw`
    EXPLAIN (ANALYZE, BUFFERS, FORMAT JSON)
    ${query}
  `;
  
  return {
    executionTime: analysis[0]['Execution Time'],
    planningTime: analysis[0]['Planning Time'],
    totalCost: analysis[0]['Total Cost'],
    actualRows: analysis[0]['Actual Rows'],
    actualLoops: analysis[0]['Actual Loops']
  };
}
```

### 5. Network Request Debugging
```typescript
export async function debugNetworkRequest(url: string) {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 5000);
  
  try {
    const response = await fetch(url, {
      signal: controller.signal,
      headers: {
        'X-Debug': '1'
      }
    });
    
    return {
      status: response.status,
      headers: Object.fromEntries(response.headers),
      timing: response.headers.get('Server-Timing'),
      size: response.headers.get('Content-Length'),
      type: response.headers.get('Content-Type')
    };
  } catch (error) {
    if (error.name === 'AbortError') {
      throw new Error(`Request to ${url} timed out after 5s`);
    }
    throw error;
  } finally {
    clearTimeout(timeout);
  }
}
```

Would you like me to:
1. Add more specific error scenarios?
2. Create debugging workflows for other features?
3. Add performance optimization guides?
4. Create more diagnostic tools and utilities?
