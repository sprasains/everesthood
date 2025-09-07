# 🚀 Performance Guide

## Overview
This guide covers performance optimization strategies and best practices.

## Metrics

### Core Web Vitals
- LCP (Largest Contentful Paint): < 2.5s
- FID (First Input Delay): < 100ms
- CLS (Cumulative Layout Shift): < 0.1

### Custom Metrics
```typescript
// Record custom metric
export const recordMetric = async (name: string, value: number) => {
  await monitoring.recordMetric({
    name,
    value,
    timestamp: Date.now(),
  });
};

// Usage
await recordMetric('api_response_time', duration);
```

## Frontend Optimization

### Component Optimization
```typescript
// Memoize expensive components
const ExpensiveComponent = React.memo(({ data }) => {
  // Render logic
});

// Use callback for event handlers
const handleClick = useCallback(() => {
  // Handler logic
}, [deps]);

// Memoize expensive calculations
const expensiveValue = useMemo(() => {
  return heavyCalculation(deps);
}, [deps]);
```

### Code Splitting
```typescript
// Dynamic imports
const DynamicComponent = dynamic(() => import('./DynamicComponent'), {
  loading: () => <LoadingSpinner />,
  ssr: false,
});

// Route-based code splitting
export default dynamic(() => import('@/pages/Dashboard'), {
  loading: () => <PageLoader />,
});
```

### Image Optimization
```typescript
import Image from 'next/image';

// Optimized image component
<Image
  src={src}
  alt={alt}
  width={width}
  height={height}
  placeholder="blur"
  blurDataURL={blurUrl}
  loading="lazy"
  quality={75}
/>
```

### CSS Optimization
```typescript
// Tailwind purge configuration
module.exports = {
  purge: [
    './src/**/*.{js,ts,jsx,tsx}',
  ],
  // ...
};

// Critical CSS
import { getCriticalCss } from '@/utils/css';

export async function getStaticProps() {
  const criticalCss = await getCriticalCss();
  return {
    props: {
      criticalCss,
    },
  };
}
```

## Backend Optimization

### Database Optimization
```typescript
// Efficient queries
const user = await prisma.user.findUnique({
  where: { id },
  select: {
    id: true,
    name: true,
    email: true,
  },
});

// Batch operations
const users = await prisma.user.createMany({
  data: newUsers,
  skipDuplicates: true,
});

// Composite indexes
model Post {
  id        String   @id @default(cuid())
  title     String
  author    User     @relation(fields: [authorId], references: [id])
  authorId  String
  createdAt DateTime @default(now())

  @@index([authorId, createdAt])
}
```

### Caching Strategy
```typescript
// Redis caching
const getCachedData = async (key: string) => {
  const cached = await redis.get(key);
  if (cached) {
    return JSON.parse(cached);
  }

  const data = await getData();
  await redis.set(key, JSON.stringify(data), 'EX', 3600);
  return data;
};

// API route caching
export const revalidate = 60; // 1 minute

// React Query
const { data } = useQuery(['key', id], fetchData, {
  staleTime: 60 * 1000, // 1 minute
  cacheTime: 5 * 60 * 1000, // 5 minutes
});
```

### Queue Optimization
```typescript
// Batch job processing
const processBatch = async (jobs: Job[]) => {
  const chunks = chunk(jobs, 10);
  for (const chunk of chunks) {
    await Promise.all(chunk.map(processJob));
  }
};

// Job scheduling
const scheduleJob = async (jobData: JobData) => {
  await queue.add('job-type', jobData, {
    attempts: 3,
    backoff: {
      type: 'exponential',
      delay: 1000,
    },
    removeOnComplete: true,
  });
};
```

## Network Optimization

### API Optimization
```typescript
// Response compression
app.use(compression());

// HTTP/2
const server = spdy.createServer(options, app);

// API response size
const compressResponse = (data: any) => {
  return {
    id: data.id,
    type: data.type,
    // Only needed fields
  };
};
```

### CDN Configuration
```typescript
// next.config.mjs
module.exports = {
  images: {
    domains: ['cdn.yourdomain.com'],
    loader: 'cloudinary',
    path: 'https://res.cloudinary.com/your-account/',
  },
};
```

## Monitoring

### Performance Monitoring
```typescript
// API response time
const recordResponseTime = async (req: Request, res: Response) => {
  const start = performance.now();
  await next();
  const duration = performance.now() - start;
  await monitoring.recordMetric({
    name: 'api_response_time',
    value: duration,
    tags: {
      path: req.path,
      method: req.method,
    },
  });
};

// Client-side metrics
export const recordWebVitals = ({ id, name, value }) => {
  monitoring.recordMetric({
    name: `web_vitals_${name.toLowerCase()}`,
    value: Math.round(name === 'CLS' ? value * 1000 : value),
    tags: { id },
  });
};
```

### Load Testing
```typescript
// k6 load test script
export default function () {
  const response = http.get('http://localhost:3000/api/data');
  check(response, {
    'is status 200': (r) => r.status === 200,
    'response time < 200ms': (r) => r.timings.duration < 200,
  });
  sleep(1);
}
```

## Best Practices

### DO
- Use appropriate caching strategies
- Optimize database queries
- Implement code splitting
- Monitor performance metrics
- Use proper indexes
- Compress responses
- Lazy load assets

### DON'T
- Fetch unnecessary data
- Use unoptimized images
- Ignore N+1 queries
- Skip performance testing
- Leave debug code in production
- Ignore memory leaks

## Tools

### Performance Testing
```bash
# Lighthouse CI
npm run lighthouse

# k6 load testing
k6 run load-test.js

# WebPageTest
npx webpagetest test https://yourdomain.com
```

### Monitoring Tools
```bash
# Node.js profiling
node --prof app.js

# Heap snapshot
node --inspect app.js
```

## Resources
- [Web Vitals](https://web.dev/vitals/)
- [Next.js Performance](https://nextjs.org/docs/advanced-features/measuring-performance)
- [Database Performance](https://www.prisma.io/docs/guides/performance-and-optimization)
- [React Performance](https://reactjs.org/docs/optimizing-performance.html)
