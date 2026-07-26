import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it } from 'vitest';

import { VerseList } from '@/components/result-card/verse-list';
import { lemmaResultCardFixture } from '@/src/lib/fixtures/result-card';

describe('VerseList', () => {
  it('is collapsed by default and expands to the full loaded verse set', async () => {
    const user = userEvent.setup();

    render(<VerseList occurrences={lemmaResultCardFixture.occurrences} />);

    const toggle = screen.getByRole('button', {
      name: 'Show 3 verse occurrences and 2 more',
    });
    expect(toggle).toHaveAttribute('aria-expanded', 'false');

    const panelId = toggle.getAttribute('aria-controls');
    expect(panelId).toBeTruthy();

    const panel = document.getElementById(panelId!);
    expect(panel).toHaveAttribute('hidden');
    // The panel caps its height and scrolls on its own for long occurrence lists, and stays
    // keyboard reachable so the scroll is operable without a pointer.
    expect(panel).toHaveClass('max-h-52.5', 'overflow-y-auto');
    expect(panel).toHaveAttribute('tabindex', '0');

    const arabicSnippet = screen.getByText(
      lemmaResultCardFixture.occurrences.allLoadedItems[0]!.arabicSnippet,
    );
    const translationSnippet = screen.getByText(
      lemmaResultCardFixture.occurrences.allLoadedItems[0]!.translationSnippet,
    );
    expect(arabicSnippet).not.toBeVisible();
    expect(translationSnippet).not.toBeVisible();

    await user.click(toggle);

    expect(toggle).toHaveAttribute('aria-expanded', 'true');
    expect(
      screen.getByRole('button', {
        name: 'Hide verse occurrences',
      }),
    ).toBe(toggle);
    expect(panel).not.toHaveAttribute('hidden');
    expect(arabicSnippet).toBeVisible();
    expect(translationSnippet).toBeVisible();
    expect(screen.getAllByRole('listitem')).toHaveLength(
      lemmaResultCardFixture.occurrences.allLoadedItems.length,
    );

    await user.click(toggle);

    expect(toggle).toHaveAttribute('aria-expanded', 'false');
    expect(panel).toHaveAttribute('hidden');
    expect(arabicSnippet).not.toBeVisible();
    expect(translationSnippet).not.toBeVisible();
  });

  it('moves focus to the first verse item when expanded with the keyboard', async () => {
    const user = userEvent.setup();

    render(<VerseList occurrences={lemmaResultCardFixture.occurrences} />);

    const toggle = screen.getByRole('button', {
      name: 'Show 3 verse occurrences and 2 more',
    });

    toggle.focus();
    await user.keyboard('{Enter}');

    expect(toggle).toHaveAttribute('aria-expanded', 'true');

    const firstVerseReference = screen.getByText(
      lemmaResultCardFixture.occurrences.allLoadedItems[0]!.referenceLabel,
    );
    const firstVerseItem = firstVerseReference.closest('li');

    expect(firstVerseItem).toHaveFocus();
  });

  it('numbers occurrences visually without repeating the ordinal to screen readers', () => {
    render(<VerseList occurrences={lemmaResultCardFixture.occurrences} />);

    const firstOrdinal = screen.getByText('1.');

    expect(firstOrdinal).toBeInTheDocument();
    // The list already conveys position through its own semantics, so the visible ordinal is
    // decorative rather than something to announce twice.
    expect(firstOrdinal).toHaveAttribute('aria-hidden', 'true');
    expect(
      screen.getByText(`${lemmaResultCardFixture.occurrences.totalCount}.`),
    ).toBeInTheDocument();
  });
});
