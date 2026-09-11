import { test, expect, type Page } from '@playwright/test';

/**
 * Drive a real lookup and wait for the card.
 *
 * The first search of a session pays for the lazy shard fetch — roughly 967 KB across three shards
 * plus index construction — so this allows well beyond the default expect timeout.
 */
async function search(page: Page, query: string) {
  await page.goto('/');
  await page.locator('#home-search').fill(query);
  const card = page.getByRole('region', { name: 'Word details' });
  await expect(card).toBeVisible({ timeout: 30_000 });
  return card;
}

/**
 * A minimal valid mono 8-bit PCM WAV (a handful of silent samples at 8 kHz). Real Chromium needs
 * bytes it can actually decode to fire `playing` — an arbitrary fake response would instead fire
 * `error`. The Content-Type header, not the .mp3 URL extension, is what the <audio> element uses to
 * pick a decoder, so serving this as `audio/wav` decodes correctly despite the URL.
 */
function silentWav(sampleCount = 800): Buffer {
  const dataSize = sampleCount;
  const header = Buffer.alloc(44);
  header.write('RIFF', 0);
  header.writeUInt32LE(36 + dataSize, 4);
  header.write('WAVE', 8);
  header.write('fmt ', 12);
  header.writeUInt32LE(16, 16); // Subchunk1Size (PCM)
  header.writeUInt16LE(1, 20); // AudioFormat = PCM
  header.writeUInt16LE(1, 22); // NumChannels
  header.writeUInt32LE(8000, 24); // SampleRate
  header.writeUInt32LE(8000, 28); // ByteRate
  header.writeUInt16LE(1, 32); // BlockAlign
  header.writeUInt16LE(8, 34); // BitsPerSample
  header.write('data', 36);
  header.writeUInt32LE(dataSize, 40);
  return Buffer.concat([header, Buffer.alloc(dataSize, 128)]);
}

test('home opens in the empty state inviting a first query', async ({ page }) => {
  await page.goto('/');

  await expect(page.getByRole('heading', { level: 1 })).toHaveText(
    'Read Quranic Arabic with transliteration support',
  );
  await expect(
    page.getByRole('heading', { level: 3, name: 'Start with a word you have heard' }),
  ).toBeVisible();
});

test('a query resolves to a live result card', async ({ page }) => {
  const wordCard = await search(page, 'rahman');

  // Contract fields: Uthmani script, a readable transliteration, and root letters.
  await expect(wordCard.getByRole('heading', { level: 2 })).toContainText('ر');
  await expect(wordCard.getByText('Root')).toBeVisible();
  await expect(page.getByRole('status', { name: 'Search status' })).toHaveText('1 result.');
});

// The no-results state is covered by tests/components/results-region.test.tsx. It is not asserted
// here because no query is reliably a non-match against a 4,199-entry fuzzy index — picking one
// would be tuning a magic string against Fuse's threshold rather than testing behaviour.

test('pressing play starts real audio playback for the primary occurrence', async ({ page }) => {
  // Route everyayah.com to a local, decodable fixture rather than hitting the third-party CDN in
  // CI — the URL pattern and card wiring are what this test is verifying, not the CDN's uptime.
  await page.route('https://everyayah.com/**', async (route) => {
    await route.fulfill({ status: 200, contentType: 'audio/wav', body: silentWav() });
  });

  await search(page, 'rahman');
  const audioRegion = page.getByRole('region', { name: 'Audio preview' });

  await audioRegion.getByRole('button', { name: /^Play audio/ }).click();

  await expect(audioRegion.getByRole('button', { name: /^Pause audio/ })).toBeVisible({
    timeout: 10_000,
  });
  await expect(audioRegion.getByText('Playing', { exact: true })).toBeVisible();
});

test('the Arabic headline renders in the self-hosted Arabic font', async ({ page }) => {
  const headline = (await search(page, 'rahman')).getByRole('heading', { level: 2 });
  const gloss = page.getByRole('region', { name: 'Word details' }).locator('p').first();

  // The :lang(ar) rule is what applies the family; before it existed the Arabic inherited Inter,
  // which carries no Arabic glyphs, and fell through to whatever the OS happened to substitute.
  const arabicFamily = await headline.evaluate((el) => getComputedStyle(el).fontFamily);
  const uiFamily = await gloss.evaluate((el) => getComputedStyle(el).fontFamily);

  // next/font mangles the family name, so match case-insensitively on the stem.
  expect(arabicFamily.toLowerCase()).toContain('scheherazade');
  expect(arabicFamily).not.toBe(uiFamily);
});

test('the font size control scales the Arabic headline and nothing else', async ({ page }) => {
  const headline = (await search(page, 'rahman')).getByRole('heading', { level: 2 });
  const gloss = page.getByRole('region', { name: 'Word details' }).locator('p').first();

  const readFontSize = (locator: typeof headline) =>
    locator.evaluate((el) => Number.parseFloat(getComputedStyle(el).fontSize));

  const baselineArabic = await readFontSize(headline);
  const baselineGloss = await readFontSize(gloss);

  await page.getByRole('button', { name: 'Extra Large' }).click();

  expect(await readFontSize(headline)).toBeGreaterThan(baselineArabic);
  expect(await readFontSize(gloss)).toBe(baselineGloss);

  await page.getByRole('button', { name: 'Small' }).click();

  expect(await readFontSize(headline)).toBeLessThan(baselineArabic);
  expect(await readFontSize(gloss)).toBe(baselineGloss);
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
