'use client';

import { useCallback, useEffect, useRef, useState } from 'react';

import { lookup } from '@/src/lib/dictionary/lookup';
import { loadVerseContext } from '@/src/lib/dictionary/verse-context';
import { toResultCard } from '@/src/lib/result-card/to-result-card';
import type { ResultsState } from '@/src/types/result-card';

/** Per the approved interaction flow in design.html. */
export const DEBOUNCE_MS = 200;
export const MIN_QUERY_LENGTH = 2;

export type UseSearchResult = {
  query: string;
  state: ResultsState;
  setQuery: (next: string) => void;
  /** Runs immediately, bypassing the debounce — Enter and the Search button. */
  submit: () => void;
  retry: () => void;
  dismissError: () => void;
};

export function useSearch(): UseSearchResult {
  const [query, setQueryState] = useState('');
  const [state, setState] = useState<ResultsState>({ kind: 'empty' });

  // Guards against out-of-order resolution: only the newest query may render. Without this a slow
  // response for an earlier query can overwrite a newer result.
  const requestIdRef = useRef(0);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const latestQueryRef = useRef('');

  const run = useCallback(async (raw: string) => {
    const trimmed = raw.trim();
    const requestId = ++requestIdRef.current;

    if (trimmed.length < MIN_QUERY_LENGTH) {
      setState({ kind: 'empty' });
      return;
    }

    setState({ kind: 'loading' });

    try {
      const matches = await lookup(trimmed, 5);
      const context = await loadVerseContext();
      if (requestId !== requestIdRef.current) return;

      const best = matches[0];
      if (!best) {
        // The did-you-mean candidate would come from a relaxed second pass; the search index does
        // not expose one yet, so the state renders without a suggestion, which it supports.
        setState({ kind: 'no-results', query: trimmed });
        return;
      }

      setState({ kind: 'ready', result: toResultCard(best, context) });
    } catch {
      if (requestId !== requestIdRef.current) return;
      setState({
        kind: 'error',
        message: 'Check your connection and try again.',
      });
    }
  }, []);

  const schedule = useCallback(
    (next: string) => {
      if (timerRef.current) clearTimeout(timerRef.current);
      timerRef.current = setTimeout(() => void run(next), DEBOUNCE_MS);
    },
    [run],
  );

  const setQuery = useCallback(
    (next: string) => {
      setQueryState(next);
      latestQueryRef.current = next;

      // Clearing returns to empty immediately; waiting out the debounce to show an invitation the
      // learner just asked for by emptying the field would feel unresponsive.
      if (next.trim().length < MIN_QUERY_LENGTH) {
        requestIdRef.current++;
        if (timerRef.current) clearTimeout(timerRef.current);
        setState({ kind: 'empty' });
        return;
      }

      schedule(next);
    },
    [schedule],
  );

  const submit = useCallback(() => {
    if (timerRef.current) clearTimeout(timerRef.current);
    void run(latestQueryRef.current);
  }, [run]);

  const dismissError = useCallback(() => {
    requestIdRef.current++;
    setState({ kind: 'empty' });
  }, []);

  useEffect(() => () => (timerRef.current ? clearTimeout(timerRef.current) : undefined), []);

  return { query, state, setQuery, submit, retry: submit, dismissError };
}
