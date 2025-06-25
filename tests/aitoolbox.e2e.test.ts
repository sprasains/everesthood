import { test, expect } from '@playwright/test';

test.describe('AIToolbox', () => {
  test('should display AI Toolbox on dashboard or tools page', async ({ page }) => {
    await page.goto('http://localhost:3000/auth/signin');
    await page.getByRole('button', { name: /Test User/i }).click();
    await page.waitForURL('**/dashboard');
    await expect(page.locator('[data-testid="ai-toolbox"]')).toBeVisible();
  });
});
