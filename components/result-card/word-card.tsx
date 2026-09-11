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
      {/*
        The headline is the only text that scales with FontSizeControl: it reads --font-size-arabic,
        which useArabicFontSize writes onto <html>. Verse snippets stay at a fixed size per the
        approved design, so the control affects Arabic display text only. The Arabic family and
        shaping features arrive through the :lang(ar) rule in globals.css.
      */}
      <h2
        lang="ar"
        dir="rtl"
        className="text-foreground rounded-[14px] bg-[linear-gradient(135deg,var(--color-surface-alt),var(--color-surface-arabic))] p-4 text-right text-(length:--font-size-arabic) leading-tight font-semibold"
      >
        {word.arabicHeadline}
      </h2>

      <div className="space-y-1">
        <p className="text-foreground text-lg leading-7 font-medium">{word.transliteration}</p>
        <p className="text-muted-foreground text-sm leading-6">{word.englishGloss}</p>
      </div>

      <RootDisplay rootLetters={word.rootLetters} />
    </section>
  );
}
