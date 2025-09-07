# 🚀 EverestHood Quick Reference

## 💻 Common Commands

### Development
```bash
# Start development server
npm run dev

# Type checking
npm run typecheck

# Linting
npm run lint

# Testing
npm run test
npm run test:e2e

# Database
npx prisma studio        # Open database UI
npx prisma generate     # Update types
npx prisma db push     # Push schema changes
```

### Git Workflow
```bash
# New feature
git checkout -b feature/name
git add .
git commit -m "feat: description"
git push origin feature/name

# Update branch
git fetch origin main
git rebase origin/main

# Quick fixes
git commit --amend      # Edit last commit
git reset --soft HEAD~1 # Undo last commit
```

## 🔥 React Snippets

### Basic Component
```tsx
export function MyComponent({ prop1, prop2 }: MyComponentProps) {
  return (
    <div>
      {/* content */}
    </div>
  );
}
```

### Form Component
```tsx
export function MyForm() {
  const [data, setData] = useState<FormData>({});
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    // handle submit
  };

  return (
    <form onSubmit={handleSubmit}>
      <input
        type="text"
        onChange={(e) => setData({ ...data, field: e.target.value })}
      />
      <button type="submit">Submit</button>
    </form>
  );
}
```

### Data Fetching
```tsx
export function DataComponent() {
  const [data, setData] = useState<Data | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    async function fetchData() {
      try {
        const response = await fetch('/api/data');
        const json = await response.json();
        setData(json);
      } catch (err) {
        setError(err as Error);
      } finally {
        setIsLoading(false);
      }
    }
    fetchData();
  }, []);

  if (isLoading) return <div>Loading...</div>;
  if (error) return <div>Error: {error.message}</div>;
  if (!data) return <div>No data</div>;

  return <div>{/* Render data */}</div>;
}
```

## 📝 Common Type Patterns

### Props Types
```typescript
// Basic props
interface ButtonProps {
  children: React.ReactNode;
  onClick?: () => void;
  variant?: 'primary' | 'secondary';
  isDisabled?: boolean;
}

// Generic props
interface ListProps<T> {
  items: T[];
  renderItem: (item: T) => React.ReactNode;
}

// Form props
interface FormProps {
  onSubmit: (data: FormData) => Promise<void>;
  initialValues?: Partial<FormData>;
}
```

### API Types
```typescript
// Request/Response
interface ApiRequest {
  query?: Record<string, string>;
  body?: Record<string, unknown>;
}

interface ApiResponse<T> {
  data: T;
  status: number;
  message?: string;
}

// Error handling
interface ApiError {
  code: string;
  message: string;
  details?: Record<string, unknown>;
}
```

## 🎨 TailwindCSS Patterns

### Layout
```tsx
// Card
<div className="rounded-lg border bg-card p-4 shadow-sm">
  <h3 className="text-lg font-semibold">Title</h3>
  <p className="mt-2 text-muted-foreground">Content</p>
</div>

// Grid
<div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
  {items.map(item => (
    <div key={item.id}>
      {/* Item content */}
    </div>
  ))}
</div>

// Stack
<div className="space-y-4">
  <div>Item 1</div>
  <div>Item 2</div>
</div>
```

### Components
```tsx
// Button variants
<button className={cn(
  "rounded-md px-4 py-2 font-medium transition-colors",
  "focus:outline-none focus:ring-2 focus:ring-offset-2",
  variant === "primary" && "bg-primary text-primary-foreground hover:bg-primary/90",
  variant === "secondary" && "bg-secondary text-secondary-foreground hover:bg-secondary/90",
  isDisabled && "opacity-50 cursor-not-allowed"
)}>
  {children}
</button>

// Form input
<input
  className={cn(
    "w-full rounded-md border border-input bg-background px-3 py-2",
    "focus:outline-none focus:ring-2 focus:ring-ring",
    error && "border-destructive"
  )}
  {...props}
/>
```

## 🔧 Common Error Solutions

### TypeScript Errors
```typescript
// Property 'x' does not exist on type 'y'
interface MyType {
  x: string; // Add missing property
}

// Object is possibly undefined
const value = obj?.property; // Use optional chaining
const value = obj!.property; // Use non-null assertion (careful!)

// Type 'string | undefined'
const value = maybeString ?? ''; // Use nullish coalescing
```

### React Errors
```typescript
// Missing dependency in useEffect
useEffect(() => {
  // Add dependency or move value inside
}, [dependency]);

// Cannot update state of unmounted component
const mounted = useRef(true);
useEffect(() => {
  return () => {
    mounted.current = false;
  };
}, []);
if (mounted.current) setState(newValue);
```

### Build Errors
```bash
# Module not found
npm install missing-module

# Type errors
rm -rf .next
rm -rf node_modules/.cache
npm run build

# Prisma errors
npx prisma generate
npx prisma migrate reset
```

## 📊 Database Patterns

### Prisma Queries
```typescript
// Create with relations
const user = await prisma.user.create({
  data: {
    email: 'user@example.com',
    profile: {
      create: {
        name: 'User Name'
      }
    }
  }
});

// Find with include
const posts = await prisma.post.findMany({
  where: {
    published: true
  },
  include: {
    author: {
      select: {
        name: true,
        email: true
      }
    }
  }
});

// Update with transactions
const [user, post] = await prisma.$transaction([
  prisma.user.update({
    where: { id },
    data: { points: { increment: 1 } }
  }),
  prisma.post.create({
    data: { userId: id }
  })
]);
```

## 🔐 Auth Patterns

### Protected API Route
```typescript
export async function GET(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    return new Response('Unauthorized', { status: 401 });
  }
  
  try {
    // Your code here
  } catch (error) {
    return new Response('Error', { status: 500 });
  }
}
```

### Protected Component
```typescript
export function ProtectedComponent() {
  const { data: session, status } = useSession();
  
  if (status === 'loading') {
    return <div>Loading...</div>;
  }
  
  if (status === 'unauthenticated') {
    return <div>Access denied</div>;
  }
  
  return <div>Protected content</div>;
}
```

## 📱 Responsive Patterns

### Breakpoints
```tsx
// Mobile first
<div className="
  grid
  grid-cols-1          // Mobile: 1 column
  sm:grid-cols-2      // Tablet: 2 columns
  lg:grid-cols-3      // Desktop: 3 columns
  gap-4
">

// Hide/Show
<div className="
  hidden           // Hidden by default
  md:block        // Show on medium screens
">

// Font sizes
<p className="
  text-sm         // Small on mobile
  md:text-base    // Base on tablet
  lg:text-lg      // Large on desktop
">
```

## 🧪 Testing Patterns

### Component Test
```typescript
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

test('component behavior', async () => {
  // Setup
  render(<MyComponent />);
  
  // Find elements
  const button = screen.getByRole('button');
  const input = screen.getByLabelText('Email');
  
  // Interact
  await userEvent.type(input, 'test@example.com');
  await userEvent.click(button);
  
  // Assert
  expect(screen.getByText('Success')).toBeInTheDocument();
});
```

### API Test
```typescript
import { createMocks } from 'node-mocks-http';

describe('API Route', () => {
  it('handles valid request', async () => {
    const { req, res } = createMocks({
      method: 'POST',
      body: { data: 'test' }
    });
    
    await handler(req, res);
    
    expect(res._getStatusCode()).toBe(200);
    expect(JSON.parse(res._getData())).toEqual({
      success: true
    });
  });
});
```
