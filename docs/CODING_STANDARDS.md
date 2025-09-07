# 📝 EverestHood Coding Standards

## Table of Contents
1. [General Guidelines](#general-guidelines)
2. [TypeScript Guidelines](#typescript-guidelines)
3. [React Guidelines](#react-guidelines)
4. [CSS/TailwindCSS Guidelines](#css-guidelines)
5. [API Guidelines](#api-guidelines)
6. [Testing Guidelines](#testing-guidelines)

## General Guidelines

### File and Folder Structure
```plaintext
components/
  ├── feature/              # Feature-specific components
  │   ├── ComponentName.tsx
  │   └── __tests__/       # Tests for the component
  ├── ui/                  # Reusable UI components
  │   ├── Button.tsx
  │   └── Input.tsx
  └── index.ts            # Barrel exports
```

### Naming Conventions
```typescript
// Files: PascalCase for components
UserProfile.tsx
AuthContext.tsx

// Functions: camelCase
function getUserData() {}
const updateProfile = () => {}

// Constants: UPPER_SNAKE_CASE
const MAX_ITEMS = 10;
const API_ENDPOINT = '/api/v1';

// Types/Interfaces: PascalCase
interface UserData {}
type ProfileProps = {}
```

### Import Order
```typescript
// 1. React and Next.js imports
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

// 2. Third-party libraries
import { motion } from 'framer-motion';
import { format } from 'date-fns';

// 3. Local components
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

// 4. Hooks, utilities, and types
import { useAuth } from '@/hooks/useAuth';
import { formatDate } from '@/lib/utils';
import type { User } from '@/types';
```

## TypeScript Guidelines

### Type Definitions
```typescript
// Use interfaces for objects
interface User {
  id: string;
  name: string;
  email: string;
  age?: number; // Optional properties with ?
}

// Use type for unions, intersections, primitives
type Status = 'pending' | 'active' | 'inactive';
type NumberOrString = number | string;
type UserWithRole = User & { role: string };

// Use generics when appropriate
interface Response<T> {
  data: T;
  status: number;
}
```

### Best Practices
```typescript
// Use type inference when possible
const [count, setCount] = useState(0); // inferred as number

// Explicit types when inference isn't clear
const [data, setData] = useState<User | null>(null);

// Function parameters and return types
function processUser(user: User): Promise<boolean> {
  // Implementation
}

// Avoid any
// ❌ Bad
function doSomething(data: any) {}

// ✅ Good
function doSomething<T>(data: T) {}
```

## React Guidelines

### Component Structure
```typescript
// 1. Imports
import { useState, useEffect } from 'react';

// 2. Types
interface Props {
  user: User;
  onUpdate: (user: User) => void;
}

// 3. Component
export function UserProfile({ user, onUpdate }: Props) {
  // 3.1 Hooks
  const [isEditing, setIsEditing] = useState(false);
  
  // 3.2 Derived state
  const fullName = `${user.firstName} ${user.lastName}`;
  
  // 3.3 Effects
  useEffect(() => {
    // Effect logic
  }, []);
  
  // 3.4 Event handlers
  const handleSubmit = () => {
    // Handler logic
  };
  
  // 3.5 Render
  return (
    <div>
      {/* JSX */}
    </div>
  );
}
```

### Hooks Guidelines
```typescript
// Custom hooks start with 'use'
function useLocalStorage<T>(key: string, initialValue: T) {
  // Implementation
}

// Keep hooks at top level
function Component() {
  // ✅ Good
  const [state, setState] = useState(null);
  
  // ❌ Bad
  if (condition) {
    useState(null); // Never do this
  }
}
```

## CSS Guidelines

### TailwindCSS Classes
```typescript
// Order classes logically
const buttonClasses = cn(
  // 1. Layout
  "flex items-center justify-center",
  // 2. Spacing
  "px-4 py-2",
  // 3. Typography
  "text-sm font-medium",
  // 4. Colors
  "bg-blue-500 text-white",
  // 5. Borders
  "rounded-md border border-transparent",
  // 6. States
  "hover:bg-blue-600 focus:outline-none focus:ring-2",
  // 7. Responsive
  "sm:px-6 md:px-8"
);
```

### Component Variants
```typescript
const buttonVariants = cva(
  "rounded-md px-4 py-2 font-medium", // Base styles
  {
    variants: {
      intent: {
        primary: "bg-blue-500 text-white hover:bg-blue-600",
        secondary: "bg-gray-100 text-gray-900 hover:bg-gray-200",
      },
      size: {
        sm: "text-sm",
        md: "text-base",
        lg: "text-lg",
      },
    },
    defaultVariants: {
      intent: "primary",
      size: "md",
    },
  }
);
```

## API Guidelines

### Route Handlers
```typescript
export async function GET(req: Request) {
  try {
    // 1. Validation
    const { searchParams } = new URL(req.url);
    const id = searchParams.get('id');
    if (!id) {
      return new Response('Missing id', { status: 400 });
    }

    // 2. Authentication
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return new Response('Unauthorized', { status: 401 });
    }

    // 3. Business Logic
    const data = await getData(id);
    if (!data) {
      return new Response('Not found', { status: 404 });
    }

    // 4. Response
    return Response.json(data);
  } catch (error) {
    // 5. Error Handling
    console.error('API error:', error);
    return new Response('Internal server error', { status: 500 });
  }
}
```

### Data Validation
```typescript
// Use Zod for validation
const UserSchema = z.object({
  name: z.string().min(2),
  email: z.string().email(),
  age: z.number().min(18).optional(),
});

// Validate input
const result = UserSchema.safeParse(input);
if (!result.success) {
  return new Response('Invalid input', { status: 400 });
}
```

## Testing Guidelines

### Component Tests
```typescript
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Button } from './Button';

describe('Button', () => {
  // 1. Rendering tests
  it('renders correctly', () => {
    render(<Button>Click me</Button>);
    expect(screen.getByRole('button')).toBeInTheDocument();
  });

  // 2. Interaction tests
  it('calls onClick when clicked', async () => {
    const onClick = jest.fn();
    render(<Button onClick={onClick}>Click me</Button>);
    
    await userEvent.click(screen.getByRole('button'));
    expect(onClick).toHaveBeenCalled();
  });

  // 3. State tests
  it('shows loading state', () => {
    render(<Button isLoading>Click me</Button>);
    expect(screen.getByRole('button')).toBeDisabled();
  });
});
```

### API Tests
```typescript
import { createMocks } from 'node-mocks-http';
import { GET } from './route';

describe('API Route', () => {
  it('returns 400 for missing id', async () => {
    const { req, res } = createMocks({
      method: 'GET',
    });

    await GET(req);
    expect(res._getStatusCode()).toBe(400);
  });

  it('returns data for valid request', async () => {
    const { req, res } = createMocks({
      method: 'GET',
      query: { id: '123' },
    });

    await GET(req);
    expect(res._getStatusCode()).toBe(200);
    expect(JSON.parse(res._getData())).toEqual(
      expect.objectContaining({
        id: '123',
      })
    );
  });
});
```

## Git Commit Guidelines

### Commit Messages
```bash
# Format: <type>(<scope>): <subject>
#
# Types:
# feat:     A new feature
# fix:      A bug fix
# docs:     Documentation only changes
# style:    Changes that don't affect the code
# refactor: Code change that neither fixes a bug nor adds a feature
# test:     Adding missing tests
# chore:    Changes to the build process or auxiliary tools

# Examples:
git commit -m "feat(auth): add social login with Google"
git commit -m "fix(api): handle null response from user service"
git commit -m "docs(readme): update installation instructions"
```

Remember:
- Write clean, maintainable code
- Follow TypeScript best practices
- Write comprehensive tests
- Document your code
- Keep components small and focused
- Use consistent naming conventions
- Handle errors gracefully
- Follow the single responsibility principle
- Make your code reviewer's job easier
