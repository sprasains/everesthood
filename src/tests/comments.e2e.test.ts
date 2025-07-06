import { test, expect } from '@playwright/test';

test.describe('Threaded Comments', () => {
  test('should display comments on a post detail page', async ({ page }) => {
    await page.goto('http://localhost:3000/auth/signin');
    await page.fill('input[name="email"]', 'test0@example.com');
    await page.fill('input[name="password"]', 'password123');
    await page.getByRole('button', { name: /Sign in/i }).click();
    await page.waitForURL('**/dashboard');
    // Go to a post detail page (replace with a valid postId or use a seeded one)
    await page.goto('http://localhost:3000/post/1');
    await expect(page.locator('[data-testid="threaded-comments"]')).toBeVisible();
  });
});
