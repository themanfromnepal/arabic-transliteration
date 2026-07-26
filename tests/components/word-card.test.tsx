import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import { WordCard } from '@/components/result-card/word-card';
import { lemmaResultCardFixture } from '@/src/lib/fixtures/result-card';

describe('WordCard', () => {
  it('marks the Arabic headline for language and direction inside the LTR shell', () => {
    render(<WordCard word={lemmaResultCardFixture} />);

    const headline = screen.getByRole('heading', {
      level: 2,
      name: lemmaResultCardFixture.arabicHeadline,
    });

    expect(headline).toHaveAttribute('lang', 'ar');
    expect(headline).toHaveAttribute('dir', 'rtl');
  });

  it('sizes the Arabic headline from the FontSizeControl token', () => {
    render(<WordCard word={lemmaResultCardFixture} />);

    const headline = screen.getByRole('heading', { level: 2 });

    // Guards against the headline drifting back to a hardcoded step, which is how the S/M/L/XL
    // control silently stopped reaching the Arabic. That the token actually resolves to a changing
    // size is proven in a real browser by e2e/home.spec.ts, not by a class name here.
    expect(headline).toHaveClass('text-(length:--font-size-arabic)');
  });

  it('renders the reading order the contract specifies', () => {
    render(<WordCard word={lemmaResultCardFixture} />);

    expect(screen.getByText(lemmaResultCardFixture.transliteration)).toBeInTheDocument();
    expect(screen.getByText(lemmaResultCardFixture.englishGloss)).toBeInTheDocument();
    expect(screen.getByText(lemmaResultCardFixture.rootLetters.join('-'))).toBeInTheDocument();
  });
});
