import { test, expect } from '@playwright/test';

test.describe('Layout Components', () => {
  test('should display Sidebar, Navbar, and Footer on main pages', async ({ page }) => {
    await page.goto('http://localhost:3000/auth/signin');
    await page.getByRole('button', { name: /Test User/i }).click();
    await page.waitForURL('**/dashboard');
    await expect(page.locator('[data-testid="sidebar"]')).toBeVisible();
    await expect(page.locator('[data-testid="navbar"]')).toBeVisible();
    await expect(page.locator('[data-testid="footer"]')).toBeVisible();
  });
});
