import * as React from 'react';

import { Skeleton } from '@/components/ui/skeleton';
import { cn } from '@/lib/utils';

type ResultCardSkeletonProps = {
  className?: string;
};

/**
 * Loading placeholder for the results region.
 *
 * The block shapes mirror the WordCard reading order — Arabic headline, transliteration, gloss,
 * root pills, audio control — so content swaps in place rather than reflowing when it arrives. The
 * outer chrome matches IntegratedResultCard for the same reason. The shimmer itself, including the
 * flat-block fallback under prefers-reduced-motion, lives in the skeleton-block class.
 */
export function ResultCardSkeleton({ className }: ResultCardSkeletonProps) {
  return (
    <div
      role="status"
      aria-label="Loading result…"
      className={cn(
        'border-border/80 bg-card/70 flex flex-col gap-4 rounded-[1.75rem] border p-5 sm:p-6',
        className,
      )}
    >
      {/* Arabic headline */}
      <Skeleton className="h-10 w-4/5" />
      {/* Transliteration */}
      <Skeleton className="h-5 w-3/5" />
      {/* English gloss */}
      <Skeleton className="h-5 w-1/2" />
      {/* Root pills */}
      <div className="flex gap-2">
        <Skeleton className="h-7 w-15 rounded-full" />
        <Skeleton className="h-7 w-15 rounded-full" />
        <Skeleton className="h-7 w-15 rounded-full" />
      </div>
      {/* Audio control */}
      <Skeleton className="h-9 w-35 rounded-lg" />
    </div>
  );
}
