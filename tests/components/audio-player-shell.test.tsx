import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';

import { AudioPlayerShell } from '@/components/result-card/audio-player-shell';
import { lemmaResultCardFixture } from '@/src/lib/fixtures/result-card';

const { audio } = lemmaResultCardFixture;

describe('AudioPlayerShell', () => {
  it('offers a play action when idle', () => {
    render(<AudioPlayerShell audio={audio} />);

    const control = screen.getByRole('button', { name: audio.controlLabels.idle });
    expect(control).toBeEnabled();
    expect(control).toHaveTextContent('Play audio');
    expect(screen.getByRole('status')).toHaveTextContent('Audio preview is ready.');
  });

  it('offers a pause action while playing, alongside a playing indicator', () => {
    render(<AudioPlayerShell audio={{ ...audio, state: 'playing' }} />);

    // The control names the action, not the state: it is a Pause button, not a spinner. A spinner
    // would say "loading" for something that is already playing.
    const control = screen.getByRole('button', { name: audio.controlLabels.playing });
    expect(control).toHaveTextContent('Pause audio');
    expect(screen.getByText('Playing')).toBeInTheDocument();
  });

  it('keeps retry one action away in the error state', () => {
    render(<AudioPlayerShell audio={{ ...audio, state: 'error' }} />);

    expect(screen.getByRole('button', { name: audio.controlLabels.error })).toBeEnabled();

    const status = screen.getByRole('status');
    expect(status).toHaveTextContent('Audio error');
    expect(status).toHaveTextContent('Audio preview is unavailable.');
  });

  it('keeps exactly one live region so a state change announces once', () => {
    const { rerender } = render(<AudioPlayerShell audio={audio} />);
    expect(screen.getAllByRole('status')).toHaveLength(1);

    rerender(<AudioPlayerShell audio={{ ...audio, state: 'error' }} />);
    expect(screen.getAllByRole('status')).toHaveLength(1);
  });

  it('prefers an explicit status message over the default helper text', () => {
    render(<AudioPlayerShell audio={{ ...audio, statusMessage: 'Buffering the recitation.' }} />);

    expect(screen.getByRole('status')).toHaveTextContent('Buffering the recitation.');
  });

  it('calls onToggle when the control is activated', async () => {
    const user = userEvent.setup();
    const onToggle = vi.fn();
    render(<AudioPlayerShell audio={audio} onToggle={onToggle} />);

    await user.click(screen.getByRole('button', { name: audio.controlLabels.idle }));

    expect(onToggle).toHaveBeenCalledTimes(1);
  });

  it('disables the control when there is no resolvable audio URL', () => {
    render(<AudioPlayerShell audio={{ ...audio, url: undefined }} />);

    expect(screen.getByRole('button', { name: audio.controlLabels.idle })).toBeDisabled();
  });
});
