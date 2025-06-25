import { test, expect } from '@playwright/test';

// E2E test for sign-in quick login with test user

test.describe('Sign-In Quick Login', () => {
  test('should quick-login as test user and redirect to dashboard', async ({ page }) => {
    await page.goto('http://localhost:3000/auth/signin');

    // Wait for the quick login panel and select the test user
    await page.getByRole('button', { name: /Test User/i }).click();

    // Should redirect to dashboard after login
    await page.waitForURL('**/dashboard');
    await expect(page).toHaveURL(/.*\/dashboard/);
    // Optionally, check for dashboard content
    await expect(page.locator('text=Welcome')).toBeVisible();
  });
});
