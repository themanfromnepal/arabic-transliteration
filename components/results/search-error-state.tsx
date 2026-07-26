import { CircleAlert, X } from 'lucide-react';
import * as React from 'react';

import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

type SearchErrorStateProps = {
  message: string;
  /** Re-runs the last query. Omitted affordances are hidden rather than rendered inert. */
  onRetry?: () => void;
  /** Returns the region to the empty state. */
  onDismiss?: () => void;
  className?: string;
};

/**
 * Recoverable data failure — a shard fetch or cache read that did not succeed.
 *
 * This is the one state that interrupts, so it carries role="alert": the learner asked for a result
 * and did not get one. Audio failures stay inline inside the result card instead, and app/error.tsx
 * remains the route-level boundary for render crashes only.
 */
export function SearchErrorState({
  message,
  onRetry,
  onDismiss,
  className,
}: SearchErrorStateProps) {
  return (
    <div
      role="alert"
      className={cn(
        'border-destructive/20 bg-destructive/5 flex items-start gap-3 rounded-xl border p-4',
        className,
      )}
    >
      <CircleAlert aria-hidden className="text-destructive mt-0.5 size-4 shrink-0" />

      <div className="min-w-0 flex-1">
        <p className="text-destructive text-sm">
          <span className="font-semibold">Could not load the dictionary</span>
          <br />
          {message}
        </p>

        {/* Retry sits with the cause, and ahead of Dismiss in the tab order. */}
        {onRetry ? (
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={onRetry}
            className="border-destructive/40 text-destructive hover:bg-destructive/10 mt-3 rounded-lg"
          >
            Retry
          </Button>
        ) : null}
      </div>

      {onDismiss ? (
        <Button
          type="button"
          variant="ghost"
          size="icon-sm"
          aria-label="Dismiss error"
          onClick={onDismiss}
          className="text-destructive hover:bg-destructive/10 shrink-0"
        >
          <X aria-hidden />
        </Button>
      ) : null}
    </div>
  );
}
