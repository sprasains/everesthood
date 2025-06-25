import { test, expect } from '@playwright/test';

test.describe('News Page', () => {
  test('should display news articles from the database', async ({ page }) => {
    await page.goto('http://localhost:3000/auth/signin');
    await page.getByRole('button', { name: /Test User/i }).click();
    await page.waitForURL('**/dashboard');
    await page.goto('http://localhost:3000/news');

    // Check for news cards/articles
    await expect(page.locator('[data-testid="news-card"], article')).toBeVisible();
  });
});
