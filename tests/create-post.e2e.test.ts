import { test, expect } from '@playwright/test';

test.describe('Create Post', () => {
  test('should create a new post and display it in the feed', async ({ page }) => {
    await page.goto('http://localhost:3000/auth/signin');
    await page.fill('input[name="email"]', 'test0@example.com');
    await page.fill('input[name="password"]', 'password123');
    await page.getByRole('button', { name: /Sign in/i }).click();
    await page.waitForURL('**/dashboard');
    await page.goto('http://localhost:3000/create-post');

    // Fill out post form (assume a textarea or rich editor exists)
    await page.getByPlaceholder('Write your post').fill('This is an E2E test post!');
    await page.getByRole('button', { name: /Post|Publish/i }).click();

    // Should redirect to dashboard or feed and show the new post
    await page.waitForURL(/dashboard|feed/);
    await expect(page.locator('text=This is an E2E test post!')).toBeVisible();
  });
});
