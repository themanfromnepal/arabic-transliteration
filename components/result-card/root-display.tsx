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
      <div className="flex flex-wrap gap-2" aria-label="Root letters">
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
