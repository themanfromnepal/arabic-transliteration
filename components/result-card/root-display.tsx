import * as React from 'react';

import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import type { ResultCardRootLetters } from '@/src/types/result-card';

type RootDisplayProps = {
  rootLetters: ResultCardRootLetters;
  className?: string;
};

export function RootDisplay({ rootLetters, className }: RootDisplayProps) {
  return (
    <div className={cn('flex flex-wrap items-center gap-2', className)}>
      <span className="text-muted-foreground text-xs font-semibold tracking-[0.24em] uppercase">
        Root
      </span>

      {/*
        Assistive technology gets the hyphenated form the spec calls for (ر-ح-م) as a single
        utterance; the pills are the visual form from the approved design and are hidden from the
        accessibility tree so screen readers do not spell out isolated letters one badge at a time.
        An aria-label on the plain wrapper would not have been exposed at all — it carried no role.
      */}
      <span className="sr-only" lang="ar" dir="rtl">
        {rootLetters.join('-')}
      </span>

      <div className="flex flex-wrap gap-2" aria-hidden="true">
        {rootLetters.map((letter, index) => (
          <Badge
            key={`${letter}-${index}`}
            variant="outline"
            className="min-w-8 rounded-full px-2.5 py-1 text-sm font-semibold"
          >
            {letter}
          </Badge>
        ))}
      </div>
    </div>
  );
}
