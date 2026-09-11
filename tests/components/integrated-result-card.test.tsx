import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';

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

  it('plays and pauses real audio when the control is activated', async () => {
    const user = userEvent.setup();
    render(<IntegratedResultCard result={lemmaResultCardFixture} />);

    await user.click(
      screen.getByRole('button', { name: lemmaResultCardFixture.audio.controlLabels.idle }),
    );

    // play() resolves and dispatches `playing` asynchronously (see tests/setup.ts), so the button
    // relabels once that event lands.
    const pauseButton = await screen.findByRole('button', {
      name: lemmaResultCardFixture.audio.controlLabels.playing,
    });
    expect(pauseButton).toHaveTextContent('Pause audio');
    expect(screen.getByText('Playing')).toBeInTheDocument();

    await user.click(pauseButton);

    expect(
      await screen.findByRole('button', {
        name: lemmaResultCardFixture.audio.controlLabels.idle,
      }),
    ).toHaveTextContent('Play audio');
  });

  it('keeps the audio button available for retry when playback fails', async () => {
    vi.spyOn(window.HTMLMediaElement.prototype, 'play').mockImplementationOnce(() =>
      Promise.reject(new Error('playback failed')),
    );

    const user = userEvent.setup();
    render(<IntegratedResultCard result={lemmaResultCardFixture} />);

    await user.click(
      screen.getByRole('button', { name: lemmaResultCardFixture.audio.controlLabels.idle }),
    );

    const retryButton = await screen.findByRole('button', {
      name: lemmaResultCardFixture.audio.controlLabels.error,
    });
    expect(retryButton).toBeEnabled();
    await waitFor(() => expect(screen.getByRole('status')).toHaveTextContent('Audio error'));
  });

  it('shows the offline-ready badge only for a cache-served result', () => {
    const { rerender } = render(<IntegratedResultCard result={lemmaResultCardFixture} />);
    expect(screen.queryByText('Offline copy')).not.toBeInTheDocument();

    rerender(<IntegratedResultCard result={lemmaResultCardFixture} servedFromCache />);
    expect(screen.getByText('Offline copy')).toBeInTheDocument();
  });
});
