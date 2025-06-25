import { test, expect } from '@playwright/test';

test.describe('GenZ Content Panel', () => {
  test('should display GenZ content on dashboard or dedicated page', async ({ page }) => {
    await page.goto('http://localhost:3000/auth/signin');
    await page.getByRole('button', { name: /Test User/i }).click();
    await page.waitForURL('**/dashboard');
    await expect(page.locator('[data-testid="genz-content-panel"]')).toBeVisible();
  });
});
