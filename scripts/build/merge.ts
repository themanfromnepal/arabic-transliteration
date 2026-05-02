import type { LoadedSources } from './parsers';
import type { QacToken } from './parsers/qac';
import type { AyahTranslation, LemmaEntry, Verse, WbwEntry } from '../../src/types/dictionary';
import { LemmaEntrySchema } from './schema';
import { latinSlug } from './translit';

export type MergedCorpus = {
  lemmas: LemmaEntry[];
  verses: Verse[];
  wbw: WbwEntry[];
  yusufali: AyahTranslation[];
  stats: { lemmas: number; occurrences: number; skippedTokens: number };
};

export type MergeOptions = { validate?: boolean };

const POS_MAP: Record<string, string> = {
  N: 'noun',
  V: 'verb',
  PN: 'proper-noun',
  ADJ: 'adjective',
  PRON: 'pronoun',
  DEM: 'demonstrative',
  REL: 'relative',
  T: 'time',
  LOC: 'location',
};

const STEM_TAGS = new Set(['N', 'V', 'PN', 'ADJ']);

type Aggregate = { entry: LemmaEntry; occSet: Set<string> };

export const mergeSources = (loaded: LoadedSources, opts: MergeOptions = {}): MergedCorpus => {
  const validate = opts.validate ?? true;
  const { verses, qacTokens, wbw, yusufali } = loaded;

  const groups = new Map<string, QacToken[]>();
  for (const tok of qacTokens) {
    const key = `${tok.sura}:${tok.ayah}:${tok.wordIndex}`;
    let arr = groups.get(key);
    if (!arr) {
      arr = [];
      groups.set(key, arr);
    }
    arr.push(tok);
  }

  let skippedTokens = 0;
  const aggregates = new Map<string, Aggregate>();

  for (const [, segs] of groups) {
    const stem = segs.find((s) => STEM_TAGS.has(s.tag)) ?? segs[0]!;
    const lemma = stem.features.LEM;
    const root = stem.features.ROOT;
    if (!lemma || !root) {
      skippedTokens += 1;
      continue;
    }
    const lemmaId = `${latinSlug(root)}-${latinSlug(lemma)}`;
    const occKey = `${stem.sura}:${stem.ayah}:${stem.wordIndex}`;
    let agg = aggregates.get(lemmaId);
    if (!agg) {
      const entry: LemmaEntry = {
        lemmaId,
        arabic: lemma,
        lemma,
        root,
        phoneticKeys: [latinSlug(lemma)],
        meaning: '',
        partOfSpeech: POS_MAP[stem.tag] ?? stem.tag,
        occurrences: [],
        reviewStatus: 'auto',
      };
      agg = { entry, occSet: new Set<string>() };
      aggregates.set(lemmaId, agg);
    }
    if (!agg.occSet.has(occKey)) {
      agg.occSet.add(occKey);
      agg.entry.occurrences.push({
        sura: stem.sura,
        ayah: stem.ayah,
        wordIndex: stem.wordIndex,
      });
    }
  }

  const lemmas: LemmaEntry[] = [];
  const ids = Array.from(aggregates.keys()).sort();
  let occurrences = 0;
  for (const id of ids) {
    const agg = aggregates.get(id)!;
    agg.entry.occurrences.sort((a, b) => {
      if (a.sura !== b.sura) return a.sura - b.sura;
      if (a.ayah !== b.ayah) return a.ayah - b.ayah;
      return a.wordIndex - b.wordIndex;
    });
    const entry = validate ? LemmaEntrySchema.parse(agg.entry) : agg.entry;
    lemmas.push(entry);
    occurrences += entry.occurrences.length;
  }

  return {
    lemmas,
    verses,
    wbw,
    yusufali,
    stats: { lemmas: lemmas.length, occurrences, skippedTokens },
  };
};
