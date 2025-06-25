import { test, expect } from '@playwright/test';

test.describe('Add Friend Flow', () => {
  test('should search for a user and send a friend request', async ({ page }) => {
    await page.goto('http://localhost:3000/auth/signin');
    await page.getByRole('button', { name: /Test User/i }).click();
    await page.waitForURL('**/dashboard');
    await page.goto('http://localhost:3000/friends');

    // Go to search tab
    await page.getByRole('tab', { name: /Search/i }).click();
    await page.getByPlaceholder('Search users').fill('user');
    // Wait for search results and send request
    await page.getByRole('button', { name: /Add Friend|Send Request/i }).first().click();
    // Confirm request sent
    await expect(page.locator('text=Request sent')).toBeVisible();
  });
});
