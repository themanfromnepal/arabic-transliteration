import { get, set, clear } from 'idb-keyval';

const MANIFEST_VERSION_KEY = '__manifest_version__';

export async function getShardFromCache<T>(key: string): Promise<T | null> {
  try {
    const value = await get<T>(key);
    return value ?? null;
  } catch {
    return null;
  }
}

export async function putShardToCache<T>(key: string, value: T): Promise<void> {
  try {
    await set(key, value);
  } catch {
    // Graceful no-op: IndexedDB unavailable or quota exceeded
  }
}

export async function getCachedManifestVersion(): Promise<string | null> {
  try {
    const value = await get<string>(MANIFEST_VERSION_KEY);
    return value ?? null;
  } catch {
    return null;
  }
}

export async function setCachedManifestVersion(version: string): Promise<void> {
  try {
    await set(MANIFEST_VERSION_KEY, version);
  } catch {
    // Graceful no-op: IndexedDB unavailable or quota exceeded
  }
}

export async function clearCache(): Promise<void> {
  try {
    await clear();
  } catch {
    // Graceful no-op: IndexedDB unavailable
  }
}
