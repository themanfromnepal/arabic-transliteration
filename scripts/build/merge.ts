import type { LoadedSources } from './parsers';
import type { QacToken } from './parsers/qac';
import type { AyahTranslation, LemmaEntry, Verse, WbwEntry } from '../../src/types/dictionary';
import { LemmaEntrySchema } from './schema';
import { latinSlug } from './translit';
import { scholarlyTranslit } from './scholarly';
import { bw2uthmani } from './buckwalter';
import { buildVerseWordIndex } from './parsers/tanzil';

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

/**
 * Derive an English gloss for a lemma from the word-by-word translation.
 *
 * The curation CSV is the authoritative source for `meaning`, but no curation pass has been done,
 * so every lemma shipped with an empty gloss and the result card had nothing to show. This supplies
 * a default for `auto` entries: the most frequent word-by-word English across the lemma's own
 * occurrences, which is exactly the join `Occurrence` already keys on.
 *
 * Ties break toward the earliest occurrence, so the output is deterministic and the drift check
 * stays meaningful. Returns '' when the corpus has nothing, leaving the field empty rather than
 * inventing a gloss.
 */
const deriveGloss = (
  occurrences: readonly { sura: number; ayah: number; wordIndex: number }[],
  wbwIndex: ReadonlyMap<string, string>,
): string => {
  const counts = new Map<string, { count: number; firstSeen: number }>();

  occurrences.forEach((occ, position) => {
    const english = wbwIndex.get(`${occ.sura}:${occ.ayah}:${occ.wordIndex}`)?.trim();
    if (!english) return;

    const existing = counts.get(english);
    if (existing) {
      existing.count += 1;
      return;
    }
    counts.set(english, { count: 1, firstSeen: position });
  });

  let best = '';
  let bestCount = 0;
  let bestFirstSeen = Number.POSITIVE_INFINITY;

  for (const [english, { count, firstSeen }] of counts) {
    if (count > bestCount || (count === bestCount && firstSeen < bestFirstSeen)) {
      best = english;
      bestCount = count;
      bestFirstSeen = firstSeen;
    }
  }

  return best;
};

export const mergeSources = (loaded: LoadedSources, opts: MergeOptions = {}): MergedCorpus => {
  const validate = opts.validate ?? true;
  const { verses, qacTokens, wbw, yusufali } = loaded;
  const verseWordIndex = buildVerseWordIndex(verses);

  const wbwIndex = new Map<string, string>();
  for (const word of wbw) {
    wbwIndex.set(`${word.sura}:${word.ayah}:${word.wordIndex}`, word.english);
  }

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
        // `arabic` is filled in below from Tanzil Uthmani text after
        // occurrences are sorted. `lemma` is seeded with the Buckwalter LEM
        // and converted to Uthmani in the same pass.
        arabic: '',
        lemma,
        root,
        // Both derived from the Buckwalter forms held here before the Uthmani conversion below.
        rootArabic: bw2uthmani(root),
        transliteration: scholarlyTranslit(lemma),
        phoneticKeys: [latinSlug(lemma)],
        // Filled below, once every occurrence for this lemma has been collected.
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
    const first = agg.entry.occurrences[0];
    if (!first) {
      throw new Error(`merge: lemma ${id} has no occurrences`);
    }
    const verseKey = `${first.sura}:${first.ayah}`;
    const words = verseWordIndex.get(verseKey);
    if (!words) {
      throw new Error(
        `merge: Tanzil verse missing for lemma ${id} at ${first.sura}:${first.ayah}:${first.wordIndex}`,
      );
    }
    // QAC wordIndex is 1-based; words[] is 0-based.
    const word = words[first.wordIndex - 1];
    if (!word) {
      throw new Error(
        `merge: Tanzil wordIndex out of range for lemma ${id} at ${first.sura}:${first.ayah}:${first.wordIndex} (verse has ${words.length} words)`,
      );
    }
    agg.entry.arabic = word;
    // Derived after the occurrence sort so the tie-break is stable across builds.
    agg.entry.meaning = deriveGloss(agg.entry.occurrences, wbwIndex);
    // `lemma` is the Uthmani citation form derived from QAC's Buckwalter LEM,
    // distinct from `arabic` (the inflected surface form at first occurrence).
    agg.entry.lemma = bw2uthmani(agg.entry.lemma);
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
