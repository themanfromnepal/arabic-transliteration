'use client';

import { useCallback, useEffect, useRef, useState } from 'react';

import type { ResultCardAudioState } from '@/src/types/result-card';

export type UseAudioPlaybackResult = {
  state: ResultCardAudioState;
  statusMessage?: string;
  toggle: () => void;
};

const ERROR_MESSAGE = 'Playback failed. Check your connection and try again.';

/**
 * Owns a real <audio> element for the result card's single audio slot. The URL changes whenever a
 * new lemma is looked up; the previous element is torn down so audio from a card that is no longer
 * shown can't keep playing underneath the new one.
 */
export function useAudioPlayback(url: string | undefined): UseAudioPlaybackResult {
  const [state, setState] = useState<ResultCardAudioState>('idle');
  const audioRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    setState('idle');

    return () => {
      const element = audioRef.current;
      audioRef.current = null;
      if (!element) return;
      element.pause();
      element.removeAttribute('src');
    };
  }, [url]);

  const toggle = useCallback(() => {
    if (!url) return;

    if (state === 'playing') {
      audioRef.current?.pause();
      return;
    }

    let element = audioRef.current;
    if (!element) {
      element = new Audio(url);
      element.addEventListener('playing', () => setState('playing'));
      // `pause` also fires immediately before `ended` at the end of playback — returning to idle
      // there is correct, not just for an explicit pause.
      element.addEventListener('pause', () =>
        setState((current) => (current === 'error' ? current : 'idle')),
      );
      element.addEventListener('error', () => setState('error'));
      audioRef.current = element;
    }

    // The control survives the error state so retry stays one action away: reusing the same
    // element and calling play() again is what a retry click does.
    element.play().catch(() => setState('error'));
  }, [state, url]);

  return {
    state,
    statusMessage: state === 'error' ? ERROR_MESSAGE : undefined,
    toggle,
  };
}
