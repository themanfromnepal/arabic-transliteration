import { get, set, clear } from 'idb-keyval';

const MANIFEST_VERSION_KEY = '__manifest_version__';
const memStore = new Map<string, unknown>();
let idbAvailable = true;

export async function getShardFromCache<T>(key: string): Promise<T | null> {
  if (!idbAvailable) {
    return (memStore.get(key) as T) ?? null;
  }
  try {
    const value = await get<T>(key);
    return value ?? null;
  } catch {
    idbAvailable = false;
    return (memStore.get(key) as T) ?? null;
  }
}

export async function putShardToCache<T>(key: string, value: T): Promise<void> {
  if (!idbAvailable) {
    memStore.set(key, value);
    return;
  }
  try {
    await set(key, value);
  } catch {
    idbAvailable = false;
    memStore.set(key, value);
  }
}

export async function getCachedManifestVersion(): Promise<string | null> {
  if (!idbAvailable) {
    return (memStore.get(MANIFEST_VERSION_KEY) as string) ?? null;
  }
  try {
    const value = await get<string>(MANIFEST_VERSION_KEY);
    return value ?? null;
  } catch {
    idbAvailable = false;
    return (memStore.get(MANIFEST_VERSION_KEY) as string) ?? null;
  }
}

export async function setCachedManifestVersion(version: string): Promise<void> {
  if (!idbAvailable) {
    memStore.set(MANIFEST_VERSION_KEY, version);
    return;
  }
  try {
    await set(MANIFEST_VERSION_KEY, version);
  } catch {
    idbAvailable = false;
    memStore.set(MANIFEST_VERSION_KEY, version);
  }
}

export async function clearCache(): Promise<void> {
  if (!idbAvailable) {
    memStore.clear();
    return;
  }
  try {
    await clear();
  } catch {
    idbAvailable = false;
    memStore.clear();
  }
}

export function _resetCacheForTesting(): void {
  idbAvailable = true;
  memStore.clear();
}
