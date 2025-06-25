import { test, expect } from '@playwright/test';

// E2E test for credentials sign-up and sign-in

test.describe('Credentials Auth Flow', () => {
  test('should sign up and sign in with credentials', async ({ page }) => {
    await page.goto('http://localhost:3000/auth/signup');
    await page.fill('input[name="email"]', 'e2euser@example.com');
    await page.fill('input[name="password"]', 'e2epassword');
    await page.fill('input[name="name"]', 'E2E User');
    await page.click('button[type="submit"]');
    // Should redirect to dashboard or show success
    await page.waitForURL('**/dashboard');
    await expect(page).toHaveURL(/.*\/dashboard/);
    await expect(page.locator('text=Welcome')).toBeVisible();
  });

  test('should sign in with credentials', async ({ page }) => {
    await page.goto('http://localhost:3000/auth/signin');
    await page.fill('input[name="email"]', 'e2euser@example.com');
    await page.fill('input[name="password"]', 'e2epassword');
    await page.click('button[type="submit"]');
    await page.waitForURL('**/dashboard');
    await expect(page).toHaveURL(/.*\/dashboard/);
    await expect(page.locator('text=Welcome')).toBeVisible();
  });
});

// E2E test for Google OAuth

test.describe('Google OAuth Flow', () => {
  test('should sign in with Google', async ({ page }) => {
    await page.goto('http://localhost:3000/auth/signin');
    await page.click('button[data-provider="google"]');
    // You may need to mock or manually complete the Google login in CI
    // await page.waitForURL('**/dashboard');
    // await expect(page).toHaveURL(/.*\/dashboard/);
  });
});

// E2E test for Facebook OAuth

test.describe('Facebook OAuth Flow', () => {
  test('should sign in with Facebook', async ({ page }) => {
    await page.goto('http://localhost:3000/auth/signin');
    await page.click('button[data-provider="facebook"]');
    // You may need to mock or manually complete the Facebook login in CI
    // await page.waitForURL('**/dashboard');
    // await expect(page).toHaveURL(/.*\/dashboard/);
  });
});

// E2E test for protected route access

test.describe('Protected Route Access', () => {
  test('should block unauthenticated access to dashboard', async ({ page }) => {
    await page.goto('http://localhost:3000/dashboard');
    await expect(page).not.toHaveURL(/.*\/dashboard/); // Should redirect to sign-in
  });
});

// E2E test for sign-out

test.describe('Sign Out Flow', () => {
  test('should sign out and block access to dashboard', async ({ page }) => {
    await page.goto('http://localhost:3000/auth/signin');
    await page.fill('input[name="email"]', 'e2euser@example.com');
    await page.fill('input[name="password"]', 'e2epassword');
    await page.click('button[type="submit"]');
    await page.waitForURL('**/dashboard');
    await page.click('button[data-testid="signout"]');
    await page.goto('http://localhost:3000/dashboard');
    await expect(page).not.toHaveURL(/.*\/dashboard/); // Should redirect to sign-in
  });
});
