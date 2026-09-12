import type {
  AyahTranslation,
  TranslationsShard,
  Verse,
  VersesShard,
} from '@/src/types/dictionary';
import { getShardFromCache, putShardToCache } from '@/src/lib/storage';

/**
 * Uthmani verse text and English translations, keyed by `sura:ayah`.
 *
 * `LemmaEntry.occurrences` carries only sura, ayah, and word index, so rendering the verse list on
 * a result card needs the verse/translation shard for each occurrence's sura. Those shards are
 * split one-per-sura (see `docs/data-pipeline.md`, B5) so a lookup fetches only the handful of
 * suras its previewed occurrences actually touch, rather than the whole Quran.
 *
 * Load this only after `loadFullDictionary`, which owns manifest-version invalidation and clears
 * the whole cache when the data generation changes. A shard cached here is therefore known to
 * belong to the current generation.
 */
export type VerseContext = {
  verse(sura: number, ayah: number): string | undefined;
  translation(sura: number, ayah: number): string | undefined;
};

const key = (sura: number, ayah: number): string => `${sura}:${ayah}`;
const suraFileName = (sura: number): string => `${String(sura).padStart(3, '0')}.json`;

// Module-level so a session that looks up lemmas across several suras keeps everything already
// fetched: loadVerseContext merges newly loaded suras into these maps rather than replacing them.
const verseMap = new Map<string, Verse>();
const translationMap = new Map<string, AyahTranslation>();
const loadedSuras = new Set<number>();
const inflightSuras = new Map<number, Promise<void>>();

async function loadShard<T>(cacheKey: string, url: string): Promise<T> {
  const cached = await getShardFromCache<T>(cacheKey);
  if (cached) return cached;

  try {
    const res = await fetch(url);
    if (!res.ok) throw new Error(`${cacheKey} fetch failed: ${res.status}`);
    const shard = (await res.json()) as T;
    await putShardToCache(cacheKey, shard);
    return shard;
  } catch (err) {
    // A stale copy beats an error; this is the path that makes an offline lookup work.
    const fallback = await getShardFromCache<T>(cacheKey);
    if (fallback) return fallback;
    throw err;
  }
}

async function loadSura(sura: number): Promise<void> {
  const [verses, translations] = await Promise.all([
    loadShard<VersesShard>(`verses:${sura}`, `/data/verses/${suraFileName(sura)}`),
    loadShard<TranslationsShard>(`translations:${sura}`, `/data/yusufali/${suraFileName(sura)}`),
  ]);

  for (const verse of verses.verses) verseMap.set(key(verse.sura, verse.ayah), verse);
  for (const t of translations.translations) translationMap.set(key(t.sura, t.ayah), t);
  loadedSuras.add(sura);
}

const context: VerseContext = {
  verse: (sura, ayah) => verseMap.get(key(sura, ayah))?.uthmani,
  translation: (sura, ayah) => translationMap.get(key(sura, ayah))?.english,
};

/**
 * Ensure the verse/translation shards for the given suras are loaded, then return the shared
 * context. Suras already loaded this session are skipped; each new one is fetched (or served from
 * IndexedDB) at most once even under concurrent calls, and merged into the shared maps.
 */
export async function loadVerseContext(suras: readonly number[]): Promise<VerseContext> {
  const unique = [...new Set(suras)].filter((sura) => !loadedSuras.has(sura));

  await Promise.all(
    unique.map((sura) => {
      let inflight = inflightSuras.get(sura);
      if (!inflight) {
        inflight = loadSura(sura).finally(() => inflightSuras.delete(sura));
        inflightSuras.set(sura, inflight);
      }
      return inflight;
    }),
  );

  return context;
}

export function _resetVerseContextForTesting(): void {
  verseMap.clear();
  translationMap.clear();
  loadedSuras.clear();
  inflightSuras.clear();
}
