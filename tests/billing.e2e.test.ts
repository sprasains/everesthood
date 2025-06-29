import { test, expect } from '@playwright/test';

test.describe('Billing Page', () => {
  test('should display billing info and Stripe portal link', async ({ page }) => {
    await page.goto('http://localhost:3000/auth/signin');
    await page.fill('input[name="email"]', 'test0@example.com');
    await page.fill('input[name="password"]', 'password123');
    await page.getByRole('button', { name: /Sign in/i }).click();
    await page.waitForURL('**/dashboard');
    await page.goto('http://localhost:3000/billing');

    // Check for billing/Stripe portal button
    await expect(page.getByRole('button', { name: /Manage Billing|Stripe Portal/i })).toBeVisible();
  });
});
