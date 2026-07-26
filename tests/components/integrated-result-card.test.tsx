import '@testing-library/jest-dom';
import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import { IntegratedResultCard } from '@/components/result-card/integrated-result-card';
import { lemmaResultCardFixture } from '@/src/lib/fixtures/result-card';

describe('IntegratedResultCard', () => {
  it('renders the integrated word and idle audio semantics from the fixture contract', () => {
    render(<IntegratedResultCard result={lemmaResultCardFixture} />);

    const article = screen.getByRole('article', {
      name: `Result for ${lemmaResultCardFixture.transliteration}`,
    });
    expect(article).toBeInTheDocument();

    const headline = screen.getByRole('heading', {
      level: 2,
      name: lemmaResultCardFixture.arabicHeadline,
    });
    expect(headline).toHaveAttribute('lang', 'ar');
    expect(headline).toHaveAttribute('dir', 'rtl');

    expect(screen.getByText(lemmaResultCardFixture.transliteration)).toBeInTheDocument();
    expect(screen.getByText(lemmaResultCardFixture.englishGloss)).toBeInTheDocument();

    expect(
      screen.getByRole('button', {
        name: lemmaResultCardFixture.audio.controlLabels.idle,
      }),
    ).toBeInTheDocument();
  });

  it('uses the playing control label and reduced-motion-safe spinner classes', () => {
    render(
      <IntegratedResultCard
        result={{
          ...lemmaResultCardFixture,
          audio: {
            ...lemmaResultCardFixture.audio,
            state: 'playing',
          },
        }}
      />,
    );

    const button = screen.getByRole('button', {
      name: lemmaResultCardFixture.audio.controlLabels.playing,
    });
    const icon = button.querySelector('svg');

    expect(button).toHaveAttribute('aria-pressed', 'true');
    expect(icon).toHaveClass('motion-safe:animate-spin');
    expect(icon).toHaveClass('motion-reduce:animate-none');
  });

  it('keeps the audio button available in the error state for retry semantics', () => {
    render(
      <IntegratedResultCard
        result={{
          ...lemmaResultCardFixture,
          audio: {
            ...lemmaResultCardFixture.audio,
            state: 'error',
          },
        }}
      />,
    );

    expect(
      screen.getByRole('button', {
        name: lemmaResultCardFixture.audio.controlLabels.error,
      }),
    ).toBeEnabled();
  });
});
