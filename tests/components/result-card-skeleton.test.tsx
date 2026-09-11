import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import { ResultCardSkeleton } from '@/components/result-card/result-card-skeleton';

describe('ResultCardSkeleton', () => {
  it('announces itself as a loading status', () => {
    render(<ResultCardSkeleton />);

    expect(screen.getByRole('status', { name: 'Loading result…' })).toBeInTheDocument();
  });

  it('mirrors the WordCard shape so content swaps in place', () => {
    const { container } = render(<ResultCardSkeleton />);

    // Arabic headline, transliteration, gloss, three root pills, audio control.
    expect(container.querySelectorAll('[data-slot="skeleton"]')).toHaveLength(7);
  });

  it('uses the shimmer treatment rather than a pulse', () => {
    const { container } = render(<ResultCardSkeleton />);

    const blocks = container.querySelectorAll('[data-slot="skeleton"]');
    for (const block of blocks) {
      // skeleton-block carries the approved gradient sweep, including the flat-block fallback under
      // prefers-reduced-motion. animate-pulse was the shadcn default and is not the specified form.
      expect(block).toHaveClass('skeleton-block');
      expect(block).not.toHaveClass('animate-pulse');
    }
  });
});
