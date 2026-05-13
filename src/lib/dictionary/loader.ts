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
import indexData from '@/public/data/index.json';

let memoryCache: DictionaryShard | null = null;
let inflightPromise: Promise<DictionaryShard> | null = null;

export function getInlineIndex(): InlineIndexEntry[] {
  return (indexData as unknown as InlineIndexShard).entries;
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
}
