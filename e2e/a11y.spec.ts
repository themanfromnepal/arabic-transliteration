import AxeBuilder from '@axe-core/playwright';
import { test, expect } from '@playwright/test';

/**
 * Accessibility gate. Zero WCAG AA violations on every route blocks merge to main, per the resolved
 * decision in docs/phases/phase-4-ui-stages.md.
 */
const ROUTES = ['/', '/about', '/credits', '/privacy'] as const;

const WCAG_AA_TAGS = ['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa'];

/** Report the rule and offending selectors, so a CI failure is actionable without a rerun. */
function summarise(violations: Awaited<ReturnType<AxeBuilder['analyze']>>['violations']) {
  return violations.map((violation) => ({
    id: violation.id,
    impact: violation.impact,
    help: violation.help,
    nodes: violation.nodes.map((node) => node.target.join(' ')),
  }));
}

for (const route of ROUTES) {
  test(`${route} has no WCAG AA violations`, async ({ page }) => {
    await page.goto(route);

    const { violations } = await new AxeBuilder({ page }).withTags(WCAG_AA_TAGS).analyze();

    expect(summarise(violations)).toEqual([]);
  });

  /*
   * Dark mode is checked separately because a light-only gate cannot see it. The static pages once
   * carried hardcoded light-theme hex values, which left body text at 1.07:1 against the dark
   * background — invisible in practice, yet the light-mode run was clean. Contrast has to be
   * verified in the theme it applies to.
   */
  test(`${route} has no WCAG AA violations in dark mode`, async ({ page }) => {
    // next-themes reads this key before first paint, so the class is applied without a flash.
    await page.addInitScript(() => window.localStorage.setItem('theme', 'dark'));
    await page.goto(route);
    await expect(page.locator('html')).toHaveClass(/dark/);

    const { violations } = await new AxeBuilder({ page }).withTags(WCAG_AA_TAGS).analyze();

    expect(summarise(violations)).toEqual([]);
  });
}

test('the result card flow is reachable and operable by keyboard alone', async ({ page }) => {
  await page.goto('/');

  await page.locator('body').click({ position: { x: 40, y: 40 } });
  await page.keyboard.press('/');
  await expect(page.locator('#home-search')).toBeFocused();

  // Typing must reach the input rather than being swallowed by the shortcut handler.
  await page.keyboard.type('rahmah');
  await expect(page.locator('#home-search')).toHaveValue('rahmah');

  // Tab forward until the verse expander takes focus, proving the card is operable without a
  // pointer. Bounded so a regression fails fast instead of hanging.
  const expander = page.getByRole('button', { name: /verse occurrences/i });
  let focused = false;
  for (let i = 0; i < 15 && !focused; i++) {
    await page.keyboard.press('Tab');
    focused = await expander.evaluate((el) => el === document.activeElement).catch(() => false);
  }
  expect(focused).toBe(true);

  await page.keyboard.press('Enter');
  await expect(expander).toHaveAttribute('aria-expanded', 'true');
});
