import * as React from 'react';

import { AudioPlayerShell } from '@/components/result-card/audio-player-shell';
import { VerseList } from '@/components/result-card/verse-list';
import { WordCard } from '@/components/result-card/word-card';
import { Separator } from '@/components/ui/separator';
import { cn } from '@/lib/utils';
import type { ResultCard } from '@/src/types/result-card';

type IntegratedResultCardProps = {
  result: ResultCard;
  className?: string;
};

export function IntegratedResultCard({ result, className }: IntegratedResultCardProps) {
  return (
    <article
      className={cn(
        'border-border/80 bg-card/70 rounded-[1.75rem] border p-5 shadow-[0_18px_55px_-36px_var(--color-shadow)] sm:p-6',
        className,
      )}
      aria-label={`Result for ${result.transliteration}`}
    >
      <div className="flex flex-col gap-5 lg:grid lg:grid-cols-[minmax(0,0.9fr)_auto_minmax(0,1.1fr)] lg:items-start lg:gap-6">
        <div className="space-y-5">
          <WordCard word={result} />
          <AudioPlayerShell audio={result.audio} />
        </div>

        <Separator className="lg:hidden" />
        <Separator orientation="vertical" className="hidden self-stretch lg:block" />

        <VerseList occurrences={result.occurrences} />
      </div>
    </article>
  );
}
