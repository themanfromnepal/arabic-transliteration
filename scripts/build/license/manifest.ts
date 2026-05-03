import { readFile } from 'node:fs/promises';
import { LicenseManifestSchema, type LicenseManifest } from './schema';

export type LoadResult =
  | { ok: true; value: LicenseManifest }
  | { ok: false; code: 'missing' | 'malformed' | 'schema'; detail: string };

export const loadManifest = async (path: string): Promise<LoadResult> => {
  let raw: string;
  try {
    raw = await readFile(path, 'utf8');
  } catch (err) {
    if ((err as NodeJS.ErrnoException).code === 'ENOENT') {
      return { ok: false, code: 'missing', detail: `file not found: ${path}` };
    }
    throw err;
  }

  let parsed: unknown;
  try {
    parsed = JSON.parse(raw);
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    return { ok: false, code: 'malformed', detail: `JSON parse error: ${message}` };
  }

  const result = LicenseManifestSchema.safeParse(parsed);
  if (!result.success) {
    const detail = result.error.issues
      .map((i) => `${i.path.join('.') || '<root>'}: ${i.message}`)
      .join('; ');
    return { ok: false, code: 'schema', detail };
  }
  return { ok: true, value: result.data };
};
