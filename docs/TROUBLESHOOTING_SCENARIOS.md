# 🔧 Common Troubleshooting Guide

## Authentication Issues

### 1. Session Not Persisting
```typescript
Problem: User session is lost after refresh or navigation.

Solutions:
1. Check NextAuth configuration:
```typescript
// next.config.mjs
export default {
  // ... other config
  auth: {
    secret: process.env.NEXTAUTH_SECRET,
    url: process.env.NEXTAUTH_URL,
  }
}
```

2. Verify environment variables:
```env
NEXTAUTH_SECRET=your-secret
NEXTAUTH_URL=http://localhost:3000
```

3. Check session provider:
```typescript
// app/layout.tsx
import { SessionProvider } from 'next-auth/react';

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <SessionProvider>{children}</SessionProvider>
  );
}
```

### 2. Protected Route Access
```typescript
Problem: Users can access protected routes when not authenticated.

Solutions:
1. Add middleware protection:
```typescript
// middleware.ts
export { default } from 'next-auth/middleware';

export const config = {
  matcher: ['/protected/:path*']
};
```

2. Add route protection:
```typescript
// app/protected/page.tsx
import { redirect } from 'next/navigation';
import { getServerSession } from 'next-auth/next';

export default async function ProtectedPage() {
  const session = await getServerSession();
  if (!session?.user) {
    redirect('/auth/signin');
  }
  // ... rest of component
}
```

## Database Issues

### 1. Prisma Client Not Working
```typescript
Problem: PrismaClient errors or connection issues.

Solutions:
1. Reset Prisma:
```bash
npx prisma generate
npx prisma db push
```

2. Check connection:
```typescript
// lib/prisma.ts
import { PrismaClient } from '@prisma/client';

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

export const prisma = globalForPrisma.prisma ?? new PrismaClient();

if (process.env.NODE_ENV !== 'production') {
  globalForPrisma.prisma = prisma;
}
```

3. Verify connection URL:
```env
DATABASE_URL="postgresql://username:password@localhost:5432/dbname"
```

### 2. Migration Issues
```typescript
Problem: Migrations failing or schema sync issues.

Solutions:
1. Reset database (CAUTION: Deletes all data):
```bash
npx prisma migrate reset
```

2. Fix migration conflicts:
```bash
# Create new migration
npx prisma migrate dev --name fix_schema

# If that fails, try force reset
npx prisma migrate reset --force
```

## Type Issues

### 1. Component Prop Types
```typescript
Problem: TypeScript errors with component props.

Solutions:
1. Define proper interfaces:
```typescript
interface ButtonProps {
  children: React.ReactNode;
  onClick?: () => void;
  variant?: 'primary' | 'secondary';
}

export function Button({ children, onClick, variant = 'primary' }: ButtonProps) {
  // Implementation
}
```

2. Use proper type imports:
```typescript
import type { User } from '@prisma/client';
import type { Session } from 'next-auth';
```

### 2. API Types
```typescript
Problem: Type errors in API routes.

Solutions:
1. Define request/response types:
```typescript
interface CreatePostRequest {
  title: string;
  content: string;
}

interface CreatePostResponse {
  id: string;
  created: boolean;
}

export async function POST(req: Request) {
  const body = (await req.json()) as CreatePostRequest;
  // Implementation
}
```

## Performance Issues

### 1. Slow Page Loads
```typescript
Problem: Pages taking too long to load.

Solutions:
1. Implement loading states:
```typescript
// app/loading.tsx
export default function Loading() {
  return <div>Loading...</div>;
}
```

2. Use proper data fetching:
```typescript
// Parallel requests
const [userData, postsData] = await Promise.all([
  fetch('/api/user'),
  fetch('/api/posts')
]);

// Streaming with Suspense
<Suspense fallback={<Loading />}>
  <SlowComponent />
</Suspense>
```

3. Optimize images:
```typescript
import Image from 'next/image';

<Image
  src={src}
  alt={alt}
  width={width}
  height={height}
  placeholder="blur"
  loading="lazy"
/>
```

### 2. Memory Leaks
```typescript
Problem: Memory usage growing over time.

Solutions:
1. Clean up subscriptions:
```typescript
useEffect(() => {
  const subscription = subscribe();
  return () => subscription.unsubscribe();
}, []);
```

2. Clear intervals/timeouts:
```typescript
useEffect(() => {
  const interval = setInterval(() => {
    // Work
  }, 1000);
  
  return () => clearInterval(interval);
}, []);
```

## UI Issues

### 1. Hydration Errors
```typescript
Problem: Hydration mismatch between server and client.

Solutions:
1. Use useEffect for client-side-only code:
```typescript
const [mounted, setMounted] = useState(false);

useEffect(() => {
  setMounted(true);
}, []);

if (!mounted) return null;
```

2. Use proper client components:
```typescript
'use client';

export function ClientComponent() {
  // Implementation
}
```

### 2. Layout Shifts
```typescript
Problem: Content jumping during load.

Solutions:
1. Use proper sizing:
```typescript
<div style={{ minHeight: '100px' }}>
  {content}
</div>
```

2. Use skeleton loading:
```typescript
function Skeleton() {
  return (
    <div className="animate-pulse">
      <div className="h-4 bg-gray-200 rounded w-3/4" />
      <div className="space-y-3 mt-4">
        <div className="h-4 bg-gray-200 rounded" />
        <div className="h-4 bg-gray-200 rounded" />
      </div>
    </div>
  );
}
```

## State Management Issues

### 1. React Query Cache
```typescript
Problem: Stale data or cache issues.

Solutions:
1. Invalidate queries:
```typescript
const queryClient = useQueryClient();

// After mutation
queryClient.invalidateQueries(['posts']);
```

2. Update cache manually:
```typescript
queryClient.setQueryData(['post', id], (old) => ({
  ...old,
  likes: old.likes + 1,
}));
```

### 2. Context Issues
```typescript
Problem: Context values not updating properly.

Solutions:
1. Proper context setup:
```typescript
const Context = createContext<State | undefined>(undefined);

function useMyContext() {
  const context = useContext(Context);
  if (context === undefined) {
    throw new Error('useMyContext must be used within Provider');
  }
  return context;
}
```

2. Memoize values:
```typescript
const value = useMemo(() => ({
  state,
  dispatch,
}), [state]);

return (
  <Context.Provider value={value}>
    {children}
  </Context.Provider>
);
```

## Testing Issues

### 1. Component Tests
```typescript
Problem: Tests failing or unreliable.

Solutions:
1. Proper test setup:
```typescript
import { render, screen } from '@testing-library/react';

beforeEach(() => {
  // Reset mocks
  jest.clearAllMocks();
});

it('renders correctly', () => {
  render(<Component />);
  expect(screen.getByRole('button')).toBeInTheDocument();
});
```

2. Async testing:
```typescript
it('loads data', async () => {
  render(<Component />);
  expect(screen.getByText('Loading')).toBeInTheDocument();
  await screen.findByText('Data');
  expect(screen.getByText('Data')).toBeInTheDocument();
});
```

Each troubleshooting solution includes:
- Problem description
- Step-by-step solutions
- Code examples
- Best practices
- Common pitfalls to avoid
