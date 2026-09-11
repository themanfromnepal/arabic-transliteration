'use client';

import { useCallback } from 'react';

import { ResultsRegion } from '@/components/results/results-region';
import { SearchBox } from '@/components/search-box';
import { useSearch } from '@/hooks/useSearch';

/**
 * Owns the live search state and joins the SearchBox to the results region.
 *
 * This is the client boundary for the home route: the page itself stays a server component, and
 * everything below here is the interaction flow approved in design.html.
 */
export function SearchExperience() {
  const { query, state, setQuery, submit, retry, dismissError } = useSearch();

  // Selecting an example or a suggestion fills the input and runs immediately, then returns focus
  // to the input so the learner can keep typing without reaching for the pointer.
  const runExample = useCallback(
    (example: string) => {
      setQuery(example);
      document.getElementById('home-search')?.focus();
    },
    [setQuery],
  );

  return (
    <>
      <SearchBox value={query} onValueChange={setQuery} onSubmit={submit} />

      <section
        aria-labelledby="results-heading"
        className="border-border/80 rounded-[calc(var(--radius)+0.75rem)] border bg-[linear-gradient(180deg,color-mix(in_srgb,var(--color-surface)_92%,transparent),color-mix(in_srgb,var(--color-surface-warm)_88%,transparent))] p-6 shadow-[0_24px_70px_-42px_var(--color-shadow)] sm:p-8"
      >
        <h2 id="results-heading" className="sr-only">
          Results
        </h2>

        <ResultsRegion
          state={state}
          onExampleSelect={runExample}
          onSuggestionSelect={runExample}
          onRetry={retry}
          onDismissError={dismissError}
        />
      </section>
    </>
  );
}
