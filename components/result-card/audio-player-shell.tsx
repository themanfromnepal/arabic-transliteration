import * as React from 'react';

import { Pause, Play, Volume2, VolumeX } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import type { ResultCardAudio } from '@/src/types/result-card';

type AudioPlayerShellProps = {
  audio: ResultCardAudio;
  /**
   * Wired by the caller that owns playback (see `useAudioPlayback`). Left undefined in tests/
   * previews that just want to render a given `audio.state` without real playback behavior.
   */
  onToggle?: () => void;
  className?: string;
};

/*
 * Per the approved design, the control exposes the action rather than the state: Play, Pause, or
 * Retry. The playing state is a Pause control paired with a separate "Playing" indicator — it is
 * deliberately not a spinner, because playback is not loading.
 */
const stateCopy = {
  idle: {
    actionText: 'Play audio',
    helperText: 'Audio preview is ready.',
    icon: Play,
  },
  playing: {
    actionText: 'Pause audio',
    helperText: 'Audio preview is playing.',
    icon: Pause,
  },
  error: {
    actionText: 'Retry audio',
    helperText: 'Audio preview is unavailable.',
    icon: Play,
  },
} as const;

export function AudioPlayerShell({ audio, onToggle, className }: AudioPlayerShellProps) {
  const { actionText, helperText, icon: Icon } = stateCopy[audio.state];
  const controlLabel = audio.controlLabels[audio.state];
  const statusMessage = audio.statusMessage ?? helperText;
  const isPlaying = audio.state === 'playing';
  const isUnavailable = audio.state === 'error';
  // No resolvable URL (a lemma with no occurrences) means there is nothing to play — disable
  // rather than point the control at a broken request.
  const isDisabled = !audio.url;

  return (
    <section className={cn('space-y-3', className)} aria-label="Audio preview">
      <p className="text-foreground truncate text-sm font-semibold">{audio.label}</p>

      <div className="flex flex-wrap items-center gap-3">
        {/*
          The control survives the error state so retry stays one action away, which is the
          recommendation recorded in the design's interactive-states annotation.
        */}
        <Button
          type="button"
          variant={isUnavailable ? 'outline' : 'default'}
          size="sm"
          className={cn(
            'rounded-lg',
            isUnavailable && 'border-destructive/40 text-destructive hover:bg-destructive/10',
          )}
          aria-label={controlLabel}
          onClick={onToggle}
          disabled={isDisabled}
        >
          <Icon aria-hidden />
          <span>{actionText}</span>
        </Button>

        {isPlaying ? (
          <span className="bg-primary/10 text-primary inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-sm font-medium">
            <Volume2 aria-hidden className="size-4" />
            Playing
          </span>
        ) : null}
      </div>

      {/*
        One polite live region for the whole audio row. Its content swaps between the plain helper
        line and the inline error block, so a state change is announced exactly once — two separate
        live regions would double-announce.
      */}
      <div role="status" aria-live="polite">
        {isUnavailable ? (
          <div className="border-destructive/20 bg-destructive/5 flex items-start gap-2 rounded-xl border p-3">
            <VolumeX aria-hidden className="text-destructive mt-0.5 size-4 shrink-0" />
            <p className="text-destructive text-sm">
              <span className="font-semibold">Audio error</span>
              <br />
              {statusMessage}
            </p>
          </div>
        ) : (
          <p className="text-muted-foreground text-sm">{statusMessage}</p>
        )}
      </div>
    </section>
  );
}
