import { test, expect } from '@playwright/test';

test.describe('Friends Page', () => {
  test('should display friends, requests, and user search', async ({ page }) => {
    await page.goto('http://localhost:3000/auth/signin');
    await page.getByRole('button', { name: /Test User/i }).click();
    await page.waitForURL('**/dashboard');
    await page.goto('http://localhost:3000/friends');

    // Tabs for friends, requests, and search
    await expect(page.getByRole('tab', { name: /Friends/i })).toBeVisible();
    await expect(page.getByRole('tab', { name: /Requests/i })).toBeVisible();
    await expect(page.getByRole('tab', { name: /Search/i })).toBeVisible();
    // Should show at least the search input
    await expect(page.getByPlaceholder('Search users')).toBeVisible();
  });
});
