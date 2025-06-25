import { test, expect } from '@playwright/test';

test.describe('Achievements Page', () => {
  test('should display achievements from the database', async ({ page }) => {
    await page.goto('http://localhost:3000/auth/signin');
    await page.getByRole('button', { name: /Test User/i }).click();
    await page.waitForURL('**/dashboard');
    await page.goto('http://localhost:3000/achievements');

    // Check for achievement cards
    await expect(page.locator('[data-testid="achievement-card"], .MuiCard-root')).toBeVisible();
  });
});
