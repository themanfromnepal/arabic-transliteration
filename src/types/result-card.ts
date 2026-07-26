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
