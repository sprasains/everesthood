import { test, expect } from '@playwright/test';

test.describe('LoadingSpinner', () => {
  test('should display loading spinner during data fetch', async ({ page }) => {
    await page.goto('http://localhost:3000/auth/signin');
    await page.fill('input[name="email"]', 'test0@example.com');
    await page.fill('input[name="password"]', 'password123');
    await page.getByRole('button', { name: /Sign in/i }).click();
    await page.waitForURL('**/dashboard');
    // Simulate navigation or action that triggers loading
    // This may need to be adjusted based on actual loading triggers
    await expect(page.locator('[data-testid="loading-spinner"]')).toBeVisible();
  });
});
