import * as React from 'react';

import { AlertCircle, LoaderCircle, Play } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import type { ResultCardAudio } from '@/src/types/result-card';

type AudioPlayerShellProps = {
  audio: ResultCardAudio;
  className?: string;
};

const stateCopy = {
  idle: {
    helperText: 'Audio preview is ready.',
    icon: Play,
    iconClassName: 'text-foreground',
  },
  playing: {
    helperText: 'Audio preview is playing.',
    icon: LoaderCircle,
    iconClassName: 'text-primary motion-safe:animate-spin motion-reduce:animate-none',
  },
  error: {
    helperText: 'Audio preview is unavailable.',
    icon: AlertCircle,
    iconClassName: 'text-destructive',
  },
} as const;

export function AudioPlayerShell({ audio, className }: AudioPlayerShellProps) {
  const { helperText, icon: Icon, iconClassName } = stateCopy[audio.state];
  const controlLabel = audio.controlLabels[audio.state];
  const statusMessage = audio.statusMessage ?? helperText;
  const isUnavailable = audio.state === 'error';

  return (
    <section className={cn('space-y-3', className)} aria-label="Audio preview">
      <div className="flex items-center justify-between gap-3">
        <div className="min-w-0">
          <p className="text-foreground truncate text-sm font-semibold">{audio.label}</p>
          <p
            className={cn('text-sm', isUnavailable ? 'text-destructive' : 'text-muted-foreground')}
            aria-live="polite"
            role="status"
          >
            {statusMessage}
          </p>
        </div>

        <Button
          type="button"
          variant={isUnavailable ? 'outline' : 'secondary'}
          size="icon-sm"
          className={cn(
            'rounded-full border',
            isUnavailable && 'border-destructive/40 text-destructive hover:bg-destructive/10',
          )}
          aria-label={controlLabel}
          aria-pressed={audio.state === 'playing'}
        >
          <Icon aria-hidden className={cn('size-4', iconClassName)} />
        </Button>
      </div>
    </section>
  );
}
