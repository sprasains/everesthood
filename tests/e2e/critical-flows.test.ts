import { test, expect } from '@playwright/test';

// Common test actions
async function signIn(page) {
  await page.goto('/auth/signin');
  await page.fill('[name="email"]', 'test@example.com');
  await page.fill('[name="password"]', 'password123');
  await page.click('button[type="submit"]');
  await expect(page).toHaveURL('/dashboard');
}

// E2E Test Suites
test.describe('Critical User Flows', () => {
  // Authentication Flow
  test.describe('Authentication', () => {
    test('completes sign up flow', async ({ page }) => {
      await page.goto('/auth/signup');
      await page.fill('[name="name"]', 'Test User');
      await page.fill('[name="email"]', `test${Date.now()}@example.com`);
      await page.fill('[name="password"]', 'password123');
      await page.click('button[type="submit"]');
      await expect(page).toHaveURL('/auth/verify');
    });

    test('handles sign in with valid credentials', async ({ page }) => {
      await signIn(page);
      await expect(page.locator('[data-testid="user-menu"]')).toBeVisible();
    });

    test('shows error with invalid credentials', async ({ page }) => {
      await page.goto('/auth/signin');
      await page.fill('[name="email"]', 'wrong@example.com');
      await page.fill('[name="password"]', 'wrongpass');
      await page.click('button[type="submit"]');
      await expect(page.locator('[data-testid="error-message"]')).toBeVisible();
    });
  });

  // Profile Management
  test.describe('Profile', () => {
    test.beforeEach(async ({ page }) => {
      await signIn(page);
    });

    test('updates profile information', async ({ page }) => {
      await page.goto('/settings/profile');
      await page.fill('[name="name"]', 'Updated Name');
      await page.click('button[type="submit"]');
      await expect(
        page.locator('[data-testid="success-message"]')
      ).toBeVisible();
      await expect(page.locator('[data-testid="user-name"]')).toHaveText(
        'Updated Name'
      );
    });

    test('uploads profile picture', async ({ page }) => {
      await page.goto('/settings/profile');
      await page.setInputFiles('input[type="file"]', 'test-assets/profile.jpg');
      await expect(page.locator('[data-testid="avatar"]')).toBeVisible();
    });
  });

  // Post Creation and Interaction
  test.describe('Posts', () => {
    test.beforeEach(async ({ page }) => {
      await signIn(page);
    });

    test('creates new post', async ({ page }) => {
      await page.goto('/create-post');
      await page.fill('[name="title"]', 'Test Post');
      await page.fill('[name="content"]', 'Test Content');
      await page.click('button[type="submit"]');
      await expect(page).toHaveURL(/\/posts\/[\w-]+/);
    });

    test('likes and comments on post', async ({ page }) => {
      await page.goto('/dashboard');
      await page.click('[data-testid="like-button"]');
      await expect(page.locator('[data-testid="like-count"]')).toHaveText('1');

      await page.fill('[data-testid="comment-input"]', 'Test Comment');
      await page.click('[data-testid="submit-comment"]');
      await expect(page.locator('[data-testid="comments-list"]')).toContainText(
        'Test Comment'
      );
    });
  });

  // Search Functionality
  test.describe('Search', () => {
    test.beforeEach(async ({ page }) => {
      await signIn(page);
    });

    test('finds users and posts', async ({ page }) => {
      await page.goto('/search');
      await page.fill('[data-testid="search-input"]', 'test');
      await page.keyboard.press('Enter');

      await expect(
        page.locator('[data-testid="search-results"]')
      ).toBeVisible();
      await expect(page.locator('[data-testid="result-item"]')).toHaveCount(10);
    });
  });

  // Events and RSVPs
  test.describe('Events', () => {
    test.beforeEach(async ({ page }) => {
      await signIn(page);
    });

    test('creates and RSVPs to event', async ({ page }) => {
      // Create event
      await page.goto('/events/create');
      await page.fill('[name="title"]', 'Test Event');
      await page.fill('[name="description"]', 'Test Description');
      await page.fill('[name="location"]', 'Test Location');
      await page.fill('[name="date"]', '2025-12-31');
      await page.click('button[type="submit"]');

      // RSVP
      await page.click('[data-testid="rsvp-button"]');
      await expect(page.locator('[data-testid="rsvp-status"]')).toHaveText(
        'Going'
      );
    });
  });

  // Accessibility Tests
  test.describe('Accessibility', () => {
    test('has correct ARIA attributes', async ({ page }) => {
      await page.goto('/');
      await expect(page.locator('nav')).toHaveAttribute('role', 'navigation');
      await expect(page.locator('main')).toHaveAttribute('role', 'main');
      await expect(page.locator('button')).toHaveAttribute('aria-label');
    });

    test('supports keyboard navigation', async ({ page }) => {
      await page.goto('/');
      await page.keyboard.press('Tab');
      await expect(page.locator(':focus')).toBeVisible();
    });
  });
});

// Performance Tests
test.describe('Performance', () => {
  test('loads dashboard within performance budget', async ({ page }) => {
    const startTime = Date.now();
    await page.goto('/dashboard');
    const loadTime = Date.now() - startTime;
    expect(loadTime).toBeLessThan(3000); // 3 second budget
  });

  test('renders list with large dataset', async ({ page }) => {
    await signIn(page);
    await page.goto('/users');
    const startTime = Date.now();
    await page.click('[data-testid="load-more"]');
    const loadTime = Date.now() - startTime;
    expect(loadTime).toBeLessThan(1000); // 1 second budget for pagination
  });
});

// Error Handling Tests
test.describe('Error Handling', () => {
  test('shows error boundary for component errors', async ({ page }) => {
    await page.goto('/test-error');
    await expect(page.locator('[data-testid="error-boundary"]')).toBeVisible();
  });

  test('handles network errors gracefully', async ({ page }) => {
    await page.route('**/api/**', (route) => route.abort());
    await page.goto('/dashboard');
    await expect(page.locator('[data-testid="error-message"]')).toBeVisible();
  });
});

// Responsive Design Tests
test.describe('Responsive Design', () => {
  test.beforeEach(async ({ page }) => {
    await signIn(page);
  });

  test('adapts to mobile viewport', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 });
    await page.goto('/dashboard');
    await expect(page.locator('[data-testid="mobile-menu"]')).toBeVisible();
  });

  test('adapts to tablet viewport', async ({ page }) => {
    await page.setViewportSize({ width: 768, height: 1024 });
    await page.goto('/dashboard');
    await expect(page.locator('[data-testid="tablet-layout"]')).toBeVisible();
  });
});
