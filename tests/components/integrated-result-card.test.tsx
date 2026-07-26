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

  it('exposes a pause action while playing', () => {
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

    expect(
      screen.getByRole('button', {
        name: lemmaResultCardFixture.audio.controlLabels.playing,
      }),
    ).toHaveTextContent('Pause audio');
    expect(screen.getByText('Playing')).toBeInTheDocument();
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

  it('shows the offline-ready badge only for a cache-served result', () => {
    const { rerender } = render(<IntegratedResultCard result={lemmaResultCardFixture} />);
    expect(screen.queryByText('Offline copy')).not.toBeInTheDocument();

    rerender(<IntegratedResultCard result={lemmaResultCardFixture} servedFromCache />);
    expect(screen.getByText('Offline copy')).toBeInTheDocument();
  });
});
