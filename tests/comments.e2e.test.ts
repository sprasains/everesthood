import { test, expect } from '@playwright/test';

test.describe('Threaded Comments', () => {
  test('should display comments on a post detail page', async ({ page }) => {
    await page.goto('http://localhost:3000/auth/signin');
    await page.getByRole('button', { name: /Test User/i }).click();
    await page.waitForURL('**/dashboard');
    // Go to a post detail page (replace with a valid postId or use a seeded one)
    await page.goto('http://localhost:3000/post/1');
    await expect(page.locator('[data-testid="threaded-comments"]')).toBeVisible();
  });
});
