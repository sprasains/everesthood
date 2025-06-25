import { test, expect } from '@playwright/test';

// E2E tests for key UI components on their respective pages

test.describe('UI Components', () => {
  test('should display PostCard in feed/dashboard', async ({ page }) => {
    await page.goto('http://localhost:3000/auth/signin');
    await page.getByRole('button', { name: /Test User/i }).click();
    await page.waitForURL('**/dashboard');
    await expect(page.locator('[data-testid="post-card"]')).toBeVisible();
  });

  test('should display NewsCard on news page', async ({ page }) => {
    await page.goto('http://localhost:3000/auth/signin');
    await page.getByRole('button', { name: /Test User/i }).click();
    await page.waitForURL('**/dashboard');
    await page.goto('http://localhost:3000/news');
    await expect(page.locator('[data-testid="news-card"]')).toBeVisible();
  });

  test('should display AchievementCard on achievements page', async ({ page }) => {
    await page.goto('http://localhost:3000/auth/signin');
    await page.getByRole('button', { name: /Test User/i }).click();
    await page.waitForURL('**/dashboard');
    await page.goto('http://localhost:3000/achievements');
    await expect(page.locator('[data-testid="achievement-card"]')).toBeVisible();
  });

  test('should display PersonaSelector on create-post page', async ({ page }) => {
    await page.goto('http://localhost:3000/auth/signin');
    await page.getByRole('button', { name: /Test User/i }).click();
    await page.waitForURL('**/dashboard');
    await page.goto('http://localhost:3000/create-post');
    await expect(page.locator('[data-testid="persona-selector"]')).toBeVisible();
  });

  test('should display StreakDisplay on dashboard', async ({ page }) => {
    await page.goto('http://localhost:3000/auth/signin');
    await page.getByRole('button', { name: /Test User/i }).click();
    await page.waitForURL('**/dashboard');
    await expect(page.locator('[data-testid="streak-display"]')).toBeVisible();
  });

  test('should display SocialFeed on dashboard', async ({ page }) => {
    await page.goto('http://localhost:3000/auth/signin');
    await page.getByRole('button', { name: /Test User/i }).click();
    await page.waitForURL('**/dashboard');
    await expect(page.locator('[data-testid="social-feed"]')).toBeVisible();
  });
});
