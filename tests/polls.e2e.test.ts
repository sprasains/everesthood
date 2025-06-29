import { test, expect } from '@playwright/test';

test.describe('PollCard', () => {
  test('should display poll cards on dashboard or polls page', async ({ page }) => {
    await page.goto('http://localhost:3000/auth/signin');
    await page.fill('input[name="email"]', 'test0@example.com');
    await page.fill('input[name="password"]', 'password123');
    await page.getByRole('button', { name: /Sign in/i }).click();
    await page.waitForURL('**/dashboard');
    await expect(page.locator('[data-testid="poll-card"]')).toBeVisible();
  });
});
