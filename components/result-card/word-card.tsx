import * as React from 'react';

import { RootDisplay } from '@/components/result-card/root-display';
import { cn } from '@/lib/utils';
import type { ResultCard } from '@/src/types/result-card';

type WordCardProps = {
  word: Pick<ResultCard, 'arabicHeadline' | 'transliteration' | 'englishGloss' | 'rootLetters'>;
  className?: string;
};

export function WordCard({ word, className }: WordCardProps) {
  return (
    <section className={cn('space-y-3', className)} aria-label="Word details">
      <div className="space-y-1">
        <h2
          lang="ar"
          dir="rtl"
          className="text-foreground text-right text-3xl leading-tight font-semibold sm:text-4xl"
        >
          {word.arabicHeadline}
        </h2>
        <p className="text-foreground text-lg leading-7 font-medium">{word.transliteration}</p>
        <p className="text-muted-foreground text-sm leading-6">{word.englishGloss}</p>
      </div>

      <RootDisplay rootLetters={word.rootLetters} />
    </section>
  );
}
