'use client';

import { ChevronDown } from 'lucide-react';
import * as React from 'react';
import { useId, useState } from 'react';

import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import type { ResultCardOccurrences, ResultCardVerseOccurrence } from '@/src/types/result-card';

type VerseListProps = {
  occurrences: ResultCardOccurrences;
  className?: string;
};

type VerseListItemProps = React.ComponentPropsWithoutRef<'li'> & {
  occurrence: ResultCardVerseOccurrence;
};

const VerseListItem = React.forwardRef<HTMLLIElement, VerseListItemProps>(function VerseListItem(
  { occurrence, className, ...props },
  ref,
) {
  return (
    <li
      ref={ref}
      tabIndex={-1}
      className={cn('border-border/70 bg-background/70 rounded-2xl border px-4 py-3', className)}
      {...props}
    >
      <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
        <span className="text-foreground text-sm font-semibold">{occurrence.referenceLabel}</span>
        <span className="text-muted-foreground text-xs">
          Surah {occurrence.sura}:{occurrence.ayah}
        </span>
      </div>
      <p lang="ar" dir="rtl" className="text-foreground mt-2 text-right text-lg leading-8">
        {occurrence.arabicSnippet}
      </p>
      <p className="text-muted-foreground mt-2 text-sm leading-6">
        {occurrence.translationSnippet}
      </p>
    </li>
  );
});

export function VerseList({ occurrences, className }: VerseListProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const generatedId = useId();
  const firstItemRef = React.useRef<HTMLLIElement | null>(null);
  const focusFirstItemOnExpandRef = React.useRef(false);
  const listId = `result-card-verses-${generatedId}`;
  const hasItems = occurrences.allLoadedItems.length > 0;
  const previewCount = Math.min(occurrences.previewCount, occurrences.allLoadedItems.length);
  const hiddenCount = Math.max(occurrences.totalCount - previewCount, 0);
  const buttonLabel = isExpanded
    ? 'Hide verse occurrences'
    : hiddenCount > 0
      ? `Show ${previewCount} verse occurrences and ${hiddenCount} more`
      : `Show ${previewCount} verse occurrences`;

  React.useEffect(() => {
    if (!isExpanded || !focusFirstItemOnExpandRef.current) {
      return;
    }

    firstItemRef.current?.focus();
    focusFirstItemOnExpandRef.current = false;
  }, [isExpanded]);

  return (
    <section className={cn('space-y-3', className)} aria-label="Verse occurrences">
      <div className="flex items-center justify-between gap-3">
        <div>
          <p className="text-foreground text-sm font-semibold">Verse occurrences</p>
          <p className="text-muted-foreground text-sm">
            {occurrences.totalCount} total {occurrences.totalCount === 1 ? 'match' : 'matches'}
          </p>
        </div>
        <Button
          type="button"
          variant="outline"
          size="sm"
          aria-expanded={isExpanded}
          aria-controls={listId}
          onKeyDown={(event) => {
            if (event.key === 'Enter' || event.key === ' ') {
              focusFirstItemOnExpandRef.current = !isExpanded;
            }
          }}
          onClick={() => {
            if (!hasItems) {
              return;
            }

            setIsExpanded((current) => !current);
          }}
          disabled={!hasItems}
          className="shrink-0 rounded-full"
        >
          {buttonLabel}
          <ChevronDown
            aria-hidden
            className={cn(
              'size-4 transition-transform motion-reduce:transition-none',
              isExpanded && 'rotate-180',
            )}
          />
        </Button>
      </div>

      <div
        id={listId}
        hidden={!isExpanded}
        className="motion-safe:data-[state=open]:animate-in motion-safe:data-[state=open]:fade-in-0 motion-reduce:data-[state=open]:animate-none"
        data-state={isExpanded ? 'open' : 'closed'}
      >
        <ul className="space-y-3">
          {occurrences.allLoadedItems.map((occurrence, index) => (
            <VerseListItem
              key={occurrence.id}
              occurrence={occurrence}
              ref={index === 0 ? firstItemRef : undefined}
              className="outline-none"
            />
          ))}
        </ul>
      </div>
    </section>
  );
}
