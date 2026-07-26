import { test, expect } from '@playwright/test';

test('home renders title and the results region', async ({ page }) => {
  await page.goto('/');

  await expect(page.getByRole('heading', { level: 1 })).toHaveText(
    'Read Quranic Arabic with transliteration support',
  );
  await expect(
    page.getByRole('heading', { level: 2, name: 'Fixture-backed integrated result card' }),
  ).toBeVisible();
});

test('home renders the staged result card', async ({ page }) => {
  await page.goto('/');

  const wordCard = page.getByRole('region', { name: 'Word details' });

  await expect(wordCard).toBeVisible();
  await expect(wordCard.getByRole('heading', { level: 2 })).toHaveText('رحمة');
  await expect(wordCard.getByText('rahmah')).toBeVisible();
  await expect(wordCard.getByText('mercy')).toBeVisible();
});

test('slash shortcut focuses the shell search input on desktop', async ({ page }) => {
  await page.goto('/');

  await page.locator('body').click({ position: { x: 40, y: 40 } });
  await page.keyboard.press('/');

  await expect(page.locator('#home-search')).toBeFocused();
});

test('slash shortcut does not hijack typing inside editable controls', async ({ page }) => {
  await page.goto('/');

  await page.evaluate(() => {
    const textarea = document.createElement('textarea');
    textarea.id = 'shortcut-guard';
    textarea.setAttribute('aria-label', 'Shortcut guard');
    textarea.style.position = 'fixed';
    textarea.style.top = '1rem';
    textarea.style.left = '1rem';
    document.body.appendChild(textarea);
  });

  const textarea = page.locator('#shortcut-guard');

  await textarea.focus();
  await page.keyboard.press('/');

  await expect(textarea).toHaveValue('/');
  await expect(page.locator('#home-search')).not.toBeFocused();
});

test('slash shortcut stays disabled on touch-centric mobile media', async ({ page }) => {
  await page.addInitScript(() => {
    const originalMatchMedia = window.matchMedia.bind(window);

    window.matchMedia = (query: string) => {
      if (query === '(any-pointer: fine)') {
        return {
          matches: false,
          media: query,
          onchange: null,
          addListener: () => {},
          removeListener: () => {},
          addEventListener: () => {},
          removeEventListener: () => {},
          dispatchEvent: () => false,
        } as MediaQueryList;
      }

      if (query === '(pointer: coarse) and (hover: none)') {
        return {
          matches: true,
          media: query,
          onchange: null,
          addListener: () => {},
          removeListener: () => {},
          addEventListener: () => {},
          removeEventListener: () => {},
          dispatchEvent: () => false,
        } as MediaQueryList;
      }

      return originalMatchMedia(query);
    };
  });

  await page.goto('/');

  await page.locator('body').click({ position: { x: 40, y: 40 } });
  await page.keyboard.press('/');

  await expect(page.locator('#home-search')).not.toBeFocused();
});
