/**
 * Generates the PWA icons and the OpenGraph social card.
 *
 * Rasterises `public/favicon.svg` through Chromium rather than hand-drawing bitmaps, so the icons
 * stay pixel-identical to the favicon and regenerate from one source if the mark ever changes.
 * Playwright is already a dev dependency for the e2e suite, so this adds no tooling.
 *
 * Run with: npm run generate-icons
 */
import { readFile, mkdir } from 'node:fs/promises';
import path from 'node:path';
import { chromium } from '@playwright/test';

const ROOT = process.cwd();
const ICON_DIR = path.join(ROOT, 'public', 'icons');

// Sourced from the light palette in app/globals.css.
const COLORS = {
  bg: '#f7f3ea',
  surface: '#fffdfa',
  fg: '#18352f',
  primary: '#2f6f5c',
  accent: '#a7863a',
  border: '#cfd8cb',
  muted: '#5f746d',
};

async function renderIcons(browser, svg) {
  const page = await browser.newPage();

  for (const size of [192, 512]) {
    await page.setViewportSize({ width: size, height: size });
    await page.setContent(`<body style="margin:0;width:${size}px;height:${size}px">${svg}</body>`, {
      waitUntil: 'load',
    });
    // The source SVG has a 64-unit viewBox; stretch it to fill the icon canvas exactly.
    await page.evaluate((s) => {
      const el = document.querySelector('svg');
      el.setAttribute('width', String(s));
      el.setAttribute('height', String(s));
    }, size);

    const target = path.join(ICON_DIR, `icon-${size}.png`);
    await page.screenshot({ path: target, omitBackground: false });
    console.log(`  icon-${size}.png`);
  }

  await page.close();
}

async function renderSocialCard(browser, svg) {
  const page = await browser.newPage();
  await page.setViewportSize({ width: 1200, height: 630 });

  await page.setContent(
    `<body style="margin:0">
      <div style="
        width:1200px;height:630px;box-sizing:border-box;
        display:flex;flex-direction:column;justify-content:center;gap:28px;
        padding:0 96px;
        font-family:-apple-system,Segoe UI,Arial,sans-serif;
        color:${COLORS.fg};
        background:
          radial-gradient(circle at top left, rgba(212,192,138,0.28), transparent 34%),
          linear-gradient(180deg, ${COLORS.surface} 0%, ${COLORS.bg} 100%);
        border-bottom:14px solid ${COLORS.primary};
      ">
        <div style="display:flex;align-items:center;gap:24px;">
          <div style="width:88px;height:88px;">${svg}</div>
          <div style="
            font-size:22px;font-weight:600;letter-spacing:0.22em;text-transform:uppercase;
            color:${COLORS.primary};
          ">Arabic Transliteration</div>
        </div>
        <div style="font-size:68px;font-weight:700;line-height:1.1;max-width:15ch;">
          Read Quranic Arabic with transliteration support
        </div>
        <div style="font-size:28px;line-height:1.45;color:${COLORS.muted};max-width:34ch;">
          Type phonetic English to find any Quranic word — script, meaning, root letters, and audio.
        </div>
      </div>
    </body>`,
    { waitUntil: 'load' },
  );

  await page.evaluate(() => {
    const el = document.querySelector('svg');
    el.setAttribute('width', '88');
    el.setAttribute('height', '88');
  });

  const target = path.join(ROOT, 'public', 'og-card.png');
  await page.screenshot({ path: target });
  console.log('  og-card.png');
  await page.close();
}

const svg = await readFile(path.join(ROOT, 'public', 'favicon.svg'), 'utf8');
await mkdir(ICON_DIR, { recursive: true });

const browser = await chromium.launch();
try {
  console.log('Generating:');
  await renderIcons(browser, svg);
  await renderSocialCard(browser, svg);
} finally {
  await browser.close();
}

// Report the results so a regeneration that silently produced nothing is visible.
for (const rel of ['icons/icon-192.png', 'icons/icon-512.png', 'og-card.png']) {
  const buf = await readFile(path.join(ROOT, 'public', rel));
  console.log(`${rel}: ${buf.byteLength} bytes`);
}
