import { test, expect } from '@playwright/test';

// Utility to generate a unique string for each test run
function unique(str: string) {
  return `${str}-${Date.now()}-${Math.floor(Math.random() * 10000)}`;
}

test.describe('Content Creation and Interaction Flow', () => {
  const user1 = { email: 'user1@example.com', password: 'Password123!' };
  const user2 = { email: 'user2@example.com', password: 'Password123!' };
  const postTitle = unique('E2E Test Post');
  const mentionName = 'user2';
  const replyText = unique('This is a nested reply!');

  test('User can create a post, another user can view and reply', async ({ page, browser }) => {
    // 1. User1 logs in
    await page.goto('/auth/signin');
    await page.fill('input[type="email"]', user1.email);
    await page.fill('input[type="password"]', user1.password);
    await page.click('button[type="submit"]');
    await expect(page.getByText('Dashboard')).toBeVisible();

    // 2. Create a new post with rich text (bold, list, @mention)
    await page.goto('/community');
    await page.click('button:has-text("New Post")');
    await page.fill('input[placeholder="Title"]', postTitle);
    // Focus the TipTap editor
    await page.click('[data-testid="tiptap-editor"]');
    // Type bold text
    await page.keyboard.down('Meta');
    await page.keyboard.press('b');
    await page.keyboard.up('Meta');
    await page.keyboard.type('Bold Text ');
    // Add a list
    await page.click('button[aria-label="Bullet List"]');
    await page.keyboard.type('First item');
    await page.keyboard.press('Enter');
    await page.keyboard.type('Second item');
    // Add a mention
    await page.keyboard.type(` @${mentionName}`);
    // Submit post
    await page.click('button:has-text("Publish")');
    await expect(page.getByText(postTitle)).toBeVisible();

    // 3. User2 logs in and verifies post formatting
    const context2 = await browser.newContext();
    const page2 = await context2.newPage();
    await page2.goto('/auth/signin');
    await page2.fill('input[type="email"]', user2.email);
    await page2.fill('input[type="password"]', user2.password);
    await page2.click('button[type="submit"]');
    await expect(page2.getByText('Dashboard')).toBeVisible();
    await page2.goto('/community');
    await expect(page2.getByText(postTitle)).toBeVisible();
    // Check bold, list, and mention formatting
    await expect(page2.locator('strong', { hasText: 'Bold Text' })).toBeVisible();
    await expect(page2.locator('ul > li', { hasText: 'First item' })).toBeVisible();
    await expect(page2.locator('ul > li', { hasText: 'Second item' })).toBeVisible();
    await expect(page2.locator('span[data-mention]', { hasText: mentionName })).toBeVisible();

    // 4. User2 adds a nested reply
    await page2.click(`text=${postTitle}`); // Go to post detail
    await page2.click('button:has-text("Drop a comment")');
    await page2.fill('textarea[placeholder="Write a comment"]', replyText);
    await page2.click('button:has-text("Post")');
    await expect(page2.getByText(replyText)).toBeVisible();

    // 5. Verify reply is correctly indented and appears in real time
    // (Assume indentation is via a CSS class or style)
    const replyLocator = page2.locator(`text=${replyText}`);
    await expect(replyLocator).toBeVisible();
    const indent = await replyLocator.evaluate(node => window.getComputedStyle(node.parentElement!).marginLeft);
    expect(Number.parseInt(indent)).toBeGreaterThan(0);

    // Optionally, check real-time update by opening a third page and verifying the reply appears
    const context3 = await browser.newContext();
    const page3 = await context3.newPage();
    await page3.goto('/community');
    await page3.click(`text=${postTitle}`);
    await expect(page3.getByText(replyText)).toBeVisible();
  });
}); 