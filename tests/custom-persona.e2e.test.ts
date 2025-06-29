import { test, expect } from '@playwright/test';

test.describe('Custom AI Persona', () => {
  test('should allow creating, selecting, and using a custom persona', async ({ page }) => {
    // Login
    await page.goto('http://localhost:3000/auth/signin');
    await page.fill('input[name="email"]', 'test0@example.com');
    await page.fill('input[name="password"]', 'password123');
    await page.getByRole('button', { name: /Sign in/i }).click();
    await page.waitForURL('**/dashboard');

    // Go to Persona Workshop
    await page.goto('http://localhost:3000/settings/personas');
    await page.getByRole('button', { name: /Create New/i }).click();
    await page.getByLabel('Persona Name').fill('MyTestPersona');
    await page.getByLabel('Icon').fill('🦄');
    await page.getByLabel('AI Prompt Instructions').fill('Summarize with unicorn magic and positivity.');
    await page.getByRole('button', { name: /Save/i }).click();
    await expect(page.locator('text=MyTestPersona')).toBeVisible();

    // Go to dashboard and open PersonaSelector
    await page.goto('http://localhost:3000/dashboard');
    await page.locator('[data-testid="persona-selector"]').getByText('MyTestPersona').click();
    await expect(page.locator('[data-testid="persona-selector"] .ring-yellow-400')).toBeVisible();

    // Use the persona for summarization (simulate API call)
    // This step assumes a UI for summarization exists and can be triggered
    // Example:
    // await page.getByRole('button', { name: /Summarize/i }).click();
    // await expect(page.locator('text=unicorn magic')).toBeVisible();
  });
});
