import { test, expect } from '@playwright/test';

test.describe('Post CRUD Flow', () => {
  test('should create, edit, and delete a post', async ({ page }) => {
    // Log in with username/password
    await page.goto('http://localhost:3000/auth/signin');
    await page.fill('input[name="email"]', 'test0@example.com');
    await page.fill('input[name="password"]', 'password123');
    await page.getByRole('button', { name: /Sign in/i }).click();
    await page.waitForURL('**/dashboard');

    // Go to create post page
    await page.goto('http://localhost:3000/posts/create');

    // Fill out post form
    await page.getByLabel('Title').fill('CRUD E2E Test Post');
    await page.getByRole('textbox').fill('This is the original content.');
    await page.getByRole('button', { name: /Publish|Post/i }).click();

    // Should redirect to post detail page
    await expect(page).toHaveURL(/\/posts\//);
    await expect(page.locator('text=CRUD E2E Test Post')).toBeVisible();
    await expect(page.locator('text=This is the original content.')).toBeVisible();

    // Edit the post
    await page.getByRole('button', { name: /Edit/i }).click();
    await page.getByLabel('Title').fill('CRUD E2E Test Post (Edited)');
    await page.getByRole('textbox').fill('This is the edited content.');
    await page.getByRole('button', { name: /Save Changes|Save/i }).click();

    // Should redirect to post detail page and show updated content
    await expect(page).toHaveURL(/\/posts\//);
    await expect(page.locator('text=CRUD E2E Test Post (Edited)')).toBeVisible();
    await expect(page.locator('text=This is the edited content.')).toBeVisible();

    // Delete the post
    await page.getByRole('button', { name: /Delete/i }).click();
    await page.getByRole('button', { name: /Confirm|Yes|OK/i }).click();

    // Should redirect to feed or dashboard and post should not be visible
    await page.waitForURL(/dashboard|feed|news-feed/);
    await expect(page.locator('text=CRUD E2E Test Post')).not.toBeVisible();
    await expect(page.locator('text=CRUD E2E Test Post (Edited)')).not.toBeVisible();
  });
}); 