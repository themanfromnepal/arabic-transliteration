import { Search } from 'lucide-react';
import * as React from 'react';

import { cn } from '@/lib/utils';

type NoResultsStateProps = {
  query: string;
  /** The top near-miss candidate, when the search pipeline can offer one (wired in Stage 4.8). */
  suggestion?: string;
  onSuggestionSelect?: (suggestion: string) => void;
  className?: string;
};

/**
 * Zero matches for an understood query.
 *
 * This is an outcome, not a fault: it uses neutral surfaces rather than the error tokens, and the
 * caller must not put the SearchBox into its invalid state — the input was valid.
 */
export function NoResultsState({
  query,
  suggestion,
  onSuggestionSelect,
  className,
}: NoResultsStateProps) {
  return (
    <div className={cn('flex flex-col gap-4', className)}>
      <div className="flex items-start gap-3">
        <Search aria-hidden className="text-muted-foreground mt-1 size-5 shrink-0" />
        <div>
          {/* The query is echoed so a typo is visible without looking back at the input. */}
          <h3 className="text-foreground text-lg font-semibold">No match for “{query}”</h3>

          {suggestion ? (
            <p className="text-muted-foreground mt-1 text-sm">
              Did you mean{' '}
              {onSuggestionSelect ? (
                <button
                  type="button"
                  onClick={() => onSuggestionSelect(suggestion)}
                  className="text-primary cursor-pointer font-semibold underline underline-offset-[3px]"
                >
                  {suggestion}
                </button>
              ) : (
                <span className="text-primary font-semibold">{suggestion}</span>
              )}
              ?
            </p>
          ) : null}
        </div>
      </div>

      <p className="text-muted-foreground max-w-prose text-sm leading-6">
        Other things to try: a shorter stem, a different vowel spelling (<code>aa</code>,{' '}
        <code>ii</code>, <code>uu</code>), or Arabizi digits for the emphatic letters.
      </p>
    </div>
  );
}
