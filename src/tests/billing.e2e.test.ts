import { test, expect } from '@playwright/test';

test.describe('Billing Page', () => {
  test('should display billing info, Stripe portal link, and usage graph', async ({
    page,
  }) => {
    await page.goto('http://localhost:3000/auth/signin');
    await page.fill('input[name="email"]', 'test0@example.com');
    await page.fill('input[name="password"]', 'password123');
    await page.getByRole('button', { name: /Sign in/i }).click();
    await page.waitForURL('**/dashboard');
    await page.goto('http://localhost:3000/billing');

    // Check for billing/Stripe portal button
    await expect(
      page.getByRole('button', { name: /Manage Billing|Stripe Portal/i })
    ).toBeVisible();

    // Check for usage graph (canvas rendered by Chart.js)
    await expect(page.locator('canvas')).toBeVisible();
    // Optionally, check for usage section heading
    await expect(page.getByText(/Usage \(last 30 days\)/i)).toBeVisible();
  });
});
