# 🔬 Testing Guide

## Overview
This guide covers our testing strategy, tools, and best practices.

## Tools
- Jest (Unit Testing)
- Vitest (Integration Testing)
- Playwright (E2E Testing)
- @testing-library/react (Component Testing)

## Test Types

### Unit Tests
Located in `__tests__` directories next to source files.
```typescript
import { validateEmail } from './utils';

describe('validateEmail', () => {
  it('accepts valid email', () => {
    expect(validateEmail('test@example.com')).toBe(true);
  });

  it('rejects invalid email', () => {
    expect(validateEmail('invalid')).toBe(false);
  });
});
```

### Integration Tests
Located in `/tests/integration`
```typescript
import { createTestCaller } from '../utils';

describe('User API', () => {
  const caller = createTestCaller();

  it('creates and retrieves user', async () => {
    const created = await caller.users.create({
      email: 'test@example.com',
      name: 'Test User',
    });
    
    const fetched = await caller.users.getById(created.id);
    expect(fetched).toEqual(created);
  });
});
```

### E2E Tests
Located in `/tests/e2e`
```typescript
test('user signup flow', async ({ page }) => {
  await page.goto('/signup');
  await page.fill('[name=email]', 'test@example.com');
  await page.fill('[name=password]', 'password123');
  await page.click('button[type=submit]');
  await expect(page).toHaveURL('/dashboard');
});
```

### Component Tests
Located in `__tests__` directories next to components
```typescript
import { render, screen } from '@testing-library/react';
import { Button } from './Button';

describe('Button', () => {
  it('renders children', () => {
    render(<Button>Click me</Button>);
    expect(screen.getByText('Click me')).toBeInTheDocument();
  });

  it('handles click', async () => {
    const onClick = vi.fn();
    render(<Button onClick={onClick}>Click me</Button>);
    await userEvent.click(screen.getByText('Click me'));
    expect(onClick).toHaveBeenCalled();
  });
});
```

## Coverage Requirements
- Unit Tests: 80% coverage
- Integration Tests: Critical paths covered
- E2E Tests: All user flows covered
- Component Tests: All interactive elements tested

## Running Tests
```bash
# Run all tests
pnpm test

# Run specific test file
pnpm test path/to/test.ts

# Run with coverage
pnpm test:coverage

# Run E2E tests
pnpm test:e2e

# Run tests in watch mode
pnpm test:watch
```

## Test Environment
```typescript
// test/setup.ts
import { beforeAll, afterAll } from 'vitest';
import { prisma } from '@/lib/prisma';
import { redis } from '@/lib/redis';

beforeAll(async () => {
  await prisma.$connect();
  await redis.connect();
});

afterAll(async () => {
  await prisma.$disconnect();
  await redis.quit();
});
```

## Mocking
```typescript
// Create test data
const mockUser = {
  id: 'user_123',
  email: 'test@example.com',
  name: 'Test User',
};

// Mock external service
vi.mock('@/lib/stripe', () => ({
  createCustomer: vi.fn().mockResolvedValue({ id: 'cus_123' }),
}));

// Mock React hooks
vi.mock('react', async () => {
  const actual = await vi.importActual('react');
  return {
    ...actual,
    useState: vi.fn().mockImplementation((init) => [init, vi.fn()]),
  };
});
```

## Best Practices

### DO
- Write tests before fixing bugs
- Keep tests focused and isolated
- Use meaningful test descriptions
- Clean up test data
- Mock external dependencies
- Test error cases
- Use test fixtures

### DON'T
- Test implementation details
- Write brittle tests
- Skip error handling tests
- Leave console.log in tests
- Use test-only dependencies in source code

## Continuous Integration
Tests run on:
- Every push to main
- Every pull request
- Before deployment

## Debug Tools
```typescript
// Debug test environment
console.log('Test ENV:', process.env.NODE_ENV);

// Debug test context
console.log('Test Context:', testContext);

// Debug API responses
console.log('API Response:', response);
```

## Common Issues

### Test Timeouts
```typescript
// Increase timeout for slow tests
describe('slow operation', () => {
  vi.setConfig({ testTimeout: 10000 });
  
  it('completes eventually', async () => {
    // ...
  });
});
```

### Database Cleanup
```typescript
afterEach(async () => {
  await prisma.user.deleteMany();
  await prisma.post.deleteMany();
});
```

### Race Conditions
```typescript
// Wait for async operations
await waitFor(() => {
  expect(screen.getByText('Success')).toBeInTheDocument();
});
```

## Resources
- [Jest Documentation](https://jestjs.io/docs/getting-started)
- [Vitest Documentation](https://vitest.dev/guide/)
- [Playwright Documentation](https://playwright.dev/docs/intro)
- [Testing Library Documentation](https://testing-library.com/docs/)
