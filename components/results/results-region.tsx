'use client';

import * as React from 'react';

import { IntegratedResultCard } from '@/components/result-card/integrated-result-card';
import { ResultCardSkeleton } from '@/components/result-card/result-card-skeleton';
import { EmptyState } from '@/components/results/empty-state';
import { NoResultsState } from '@/components/results/no-results-state';
import { SearchErrorState } from '@/components/results/search-error-state';
import { cn } from '@/lib/utils';
import type { ResultsState } from '@/src/types/result-card';

type ResultsRegionProps = {
  state: ResultsState;
  onExampleSelect?: (example: string) => void;
  onSuggestionSelect?: (suggestion: string) => void;
  onRetry?: () => void;
  onDismissError?: () => void;
  className?: string;
};

/**
 * Announcement text for the shared live region.
 *
 * Loading is deliberately silent here: the skeleton carries its own role="status", so announcing
 * from both places would give screen reader users two competing messages. The error state is silent
 * for the same reason — its block is a role="alert".
 */
function announcementFor(state: ResultsState): string {
  switch (state.kind) {
    case 'ready':
      return '1 result.';
    case 'no-results':
      return `No results for “${state.query}”.`;
    default:
      return '';
  }
}

/** Keyed so React remounts the content on a state change, which replays the crossfade. */
function contentKeyFor(state: ResultsState): string {
  return state.kind === 'ready' ? `ready-${state.result.id}` : state.kind;
}

/**
 * The single container that holds every canonical UX state.
 *
 * Empty, loading, no-results, error, and the result card are alternate contents of this one region,
 * not separate screens. It reserves a minimum height so the page does not reflow as the learner
 * moves between them, which is what keeps the CLS budget in docs/performance.md intact.
 *
 * Keyboard focus is never moved from here; it stays wherever the learner put it, which for a search
 * flow is the SearchBox. Focus moves only on explicit activation of a control inside a state.
 */
export function ResultsRegion({
  state,
  onExampleSelect,
  onSuggestionSelect,
  onRetry,
  onDismissError,
  className,
}: ResultsRegionProps) {
  /*
   * The fade belongs to a state *change*, not to first paint. Animating the initial render would
   * start the region at opacity 0, and Chrome does not count an invisible element towards LCP, so a
   * decorative fade would push the metric out. The first client render matches the server render
   * because the ref only flips in an effect.
   */
  const hasRenderedRef = React.useRef(false);
  const isStateChange = hasRenderedRef.current;

  React.useEffect(() => {
    hasRenderedRef.current = true;
  }, []);

  return (
    <div className={cn('min-h-72', className)}>
      {/*
        One polite live region for the whole results outcome, always present in the DOM so that
        content arriving into it is announced. Individual states do not carry their own.
      */}
      <div role="status" aria-live="polite" aria-label="Search status" className="sr-only">
        {announcementFor(state)}
      </div>

      <div key={contentKeyFor(state)} className={cn(isStateChange && 'state-fade-in')}>
        {state.kind === 'empty' ? <EmptyState onExampleSelect={onExampleSelect} /> : null}

        {state.kind === 'loading' ? <ResultCardSkeleton /> : null}

        {state.kind === 'ready' ? (
          <IntegratedResultCard result={state.result} servedFromCache={state.servedFromCache} />
        ) : null}

        {state.kind === 'no-results' ? (
          <NoResultsState
            query={state.query}
            suggestion={state.suggestion}
            onSuggestionSelect={onSuggestionSelect}
          />
        ) : null}

        {state.kind === 'error' ? (
          <SearchErrorState message={state.message} onRetry={onRetry} onDismiss={onDismissError} />
        ) : null}
      </div>
    </div>
  );
}
