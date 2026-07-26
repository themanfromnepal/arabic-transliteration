export type ResultCardRootLetters = [string, string, string] | [string, string, string, string];

export type ResultCardAudioState = 'idle' | 'playing' | 'error';

export type ResultCardAudioControlLabels = Record<ResultCardAudioState, string>;

export type ResultCardAudio = {
  label: string;
  controlLabels: ResultCardAudioControlLabels;
  state: ResultCardAudioState;
  statusMessage?: string;
};

export type ResultCardVerseOccurrence = {
  id: string;
  sura: number;
  ayah: number;
  referenceLabel: string;
  arabicSnippet: string;
  translationSnippet: string;
};

export type ResultCardOccurrences = {
  previewCount: number;
  totalCount: number;
  allLoadedItems: ResultCardVerseOccurrence[];
};

export type ResultCard = {
  id: string;
  arabicHeadline: string;
  transliteration: string;
  englishGloss: string;
  rootLetters: ResultCardRootLetters;
  audio: ResultCardAudio;
  occurrences: ResultCardOccurrences;
};

/**
 * The canonical UX states from docs/ux-design.md, modelled as one discriminated union because they
 * are alternate contents of a single results region rather than separate screens.
 *
 * Callbacks are intentionally not part of the state: they belong to the component that renders it,
 * so the state stays serializable and can cross the server/client boundary.
 */
export type ResultsState =
  | { kind: 'empty' }
  | { kind: 'loading' }
  | { kind: 'ready'; result: ResultCard; servedFromCache?: boolean }
  | { kind: 'no-results'; query: string; suggestion?: string }
  | { kind: 'error'; message: string };
