import { test, expect } from '@playwright/test';

test('home renders title', async ({ page }) => {
  await page.goto('/');
  await expect(page.locator('h1')).toContainText('Arabic Transliteration');
});
