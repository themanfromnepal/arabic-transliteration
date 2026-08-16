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
 * a result card needs both of these shards. They are loaded lazily on the first lookup and cached
 * in IndexedDB alongside the dictionary.
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

let contextCache: VerseContext | null = null;
let inflight: Promise<VerseContext> | null = null;

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

export async function loadVerseContext(): Promise<VerseContext> {
  if (contextCache) return contextCache;
  if (inflight) return inflight;

  inflight = (async () => {
    const [verses, translations] = await Promise.all([
      loadShard<VersesShard>('verses', '/data/verses.json'),
      loadShard<TranslationsShard>('translations', '/data/yusufali.json'),
    ]);

    const verseMap = new Map<string, Verse>();
    for (const verse of verses.verses) verseMap.set(key(verse.sura, verse.ayah), verse);

    const translationMap = new Map<string, AyahTranslation>();
    for (const t of translations.translations) translationMap.set(key(t.sura, t.ayah), t);

    contextCache = {
      verse: (sura, ayah) => verseMap.get(key(sura, ayah))?.uthmani,
      translation: (sura, ayah) => translationMap.get(key(sura, ayah))?.english,
    };
    return contextCache;
  })();

  try {
    return await inflight;
  } finally {
    inflight = null;
  }
}

export function _resetVerseContextForTesting(): void {
  contextCache = null;
  inflight = null;
}
