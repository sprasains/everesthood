import { test, expect } from '@playwright/test';

test.describe('Profile Page', () => {
  test('should display and update user profile', async ({ page }) => {
    await page.goto('http://localhost:3000/auth/signin');
    await page.getByRole('button', { name: /Test User/i }).click();
    await page.waitForURL('**/dashboard');
    await page.goto('http://localhost:3000/profile');

    // Check for profile info
    await expect(page.locator('text=Profile')).toBeVisible();
    await expect(page.getByLabel('Name')).toBeVisible();
    // Optionally, update name
    await page.getByLabel('Name').fill('Test User Updated');
    await page.getByRole('button', { name: /Save|Update/i }).click();
    // Confirm update
    await expect(page.locator('text=Profile updated')).toBeVisible();
  });
});
