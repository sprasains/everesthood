import { test, expect } from '@playwright/test';

test.describe('Profile View', () => {
  test('should view another user profile', async ({ page }) => {
    await page.goto('http://localhost:3000/auth/signin');
    await page.fill('input[name="email"]', 'test0@example.com');
    await page.fill('input[name="password"]', 'password123');
    await page.getByRole('button', { name: /Sign in/i }).click();
    await page.waitForURL('**/dashboard');
    // Go to a user profile (replace with a valid userId or use a test user)
    await page.goto('http://localhost:3000/profile/1');
    await expect(page.locator('text=Profile')).toBeVisible();
  });
});
