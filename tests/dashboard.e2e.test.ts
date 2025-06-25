import { test, expect } from '@playwright/test';

// E2E test for dashboard page and user data

test.describe('Dashboard', () => {
  test('should display user info and posts after login', async ({ page }) => {
    // Login as test user
    await page.goto('http://localhost:3000/auth/signin');
    await page.getByRole('button', { name: /Test User/i }).click();
    await page.waitForURL('**/dashboard');

    // Check for user status panel or welcome message
    await expect(page.locator('text=Welcome')).toBeVisible();
    // Check for posts/feed
    await expect(page.locator('[data-testid="post-card"], [data-testid="social-feed"]')).toBeVisible();
  });
});
