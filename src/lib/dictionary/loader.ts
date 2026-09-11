import type {
  DictionaryShard,
  InlineIndexEntry,
  InlineIndexShard,
  ManifestShard,
} from '@/src/types/dictionary';
import {
  getShardFromCache,
  putShardToCache,
  getCachedManifestVersion,
  setCachedManifestVersion,
  clearCache,
} from '@/src/lib/storage';
let memoryCache: DictionaryShard | null = null;
let inflightPromise: Promise<DictionaryShard> | null = null;
let indexCache: InlineIndexEntry[] | null = null;
let indexInflight: Promise<InlineIndexEntry[]> | null = null;

/**
 * Fetches the lemma index shard.
 *
 * This was previously a static `import` of `public/data/index.json`. That import placed all 4,199
 * entries — 64 KB gzipped — into the initial JS bundle of every visitor, and because this module is
 * on the import path of `lookup`, any client component that searched would have pulled it in and
 * taken initial JS from 139 KB past the 200 KB budget in docs/architecture.md. It also duplicated
 * data that `dictionary.json` already carries, so the copy bought nothing.
 */
export async function getInlineIndex(): Promise<InlineIndexEntry[]> {
  if (indexCache) return indexCache;
  if (indexInflight) return indexInflight;

  indexInflight = (async () => {
    const res = await fetch('/data/index.json');
    if (!res.ok) throw new Error(`Index fetch failed: ${res.status}`);
    const shard = (await res.json()) as InlineIndexShard;
    indexCache = shard.entries;
    return shard.entries;
  })();

  try {
    return await indexInflight;
  } finally {
    indexInflight = null;
  }
}

export async function loadFullDictionary(): Promise<DictionaryShard> {
  if (memoryCache) return memoryCache;
  if (inflightPromise) return inflightPromise;

  inflightPromise = doLoad();
  try {
    return await inflightPromise;
  } finally {
    inflightPromise = null;
  }
}

async function doLoad(): Promise<DictionaryShard> {
  const cached = await getShardFromCache<DictionaryShard>('dictionary');

  try {
    const manifestRes = await fetch('/data/manifest.json');
    if (!manifestRes.ok) throw new Error(`Manifest fetch failed: ${manifestRes.status}`);
    const manifest = (await manifestRes.json()) as ManifestShard;
    const freshVersion = manifest._meta?.generatedAt;
    if (!freshVersion) throw new Error('Manifest missing _meta.generatedAt');

    const cachedVersion = await getCachedManifestVersion();

    if (cached && cachedVersion === freshVersion) {
      memoryCache = cached;
      return cached;
    }

    if (cachedVersion !== null && cachedVersion !== freshVersion) {
      await clearCache();
    }

    const dictRes = await fetch('/data/dictionary.json');
    if (!dictRes.ok) throw new Error(`Dictionary fetch failed: ${dictRes.status}`);
    const dict = (await dictRes.json()) as DictionaryShard;

    await putShardToCache('dictionary', dict);
    await setCachedManifestVersion(freshVersion);

    memoryCache = dict;
    return dict;
  } catch (err) {
    if (cached) {
      console.warn('Network unavailable — serving cached dictionary without staleness check');
      memoryCache = cached;
      return cached;
    }
    throw err;
  }
}

export function _resetForTesting(): void {
  memoryCache = null;
  inflightPromise = null;
  indexCache = null;
  indexInflight = null;
}
