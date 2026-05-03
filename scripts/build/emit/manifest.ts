import type { MergedCorpus } from '../merge';
import type { ManifestShard } from '../../../src/types/dictionary';

const MANIFEST_SCHEMA_VERSION = '1.0.0';

/**
 * Build the `manifest.json` payload (counts + schema version).
 *
 * Per-source provenance lives in `_meta.sources`, which is computed by the
 * license gate and injected via the shared `_meta` injector in `write.ts`.
 * `buildManifest` deliberately does NO file hashing — the canonical digests
 * are produced once by the gate and reused everywhere.
 */
export const buildManifest = (corpus: MergedCorpus): ManifestShard => {
  const occurrences = corpus.lemmas.reduce((acc, l) => acc + l.occurrences.length, 0);
  return {
    schemaVersion: MANIFEST_SCHEMA_VERSION,
    counts: {
      lemmas: corpus.lemmas.length,
      verses: corpus.verses.length,
      wbw: corpus.wbw.length,
      yusufali: corpus.yusufali.length,
      occurrences,
    },
  };
};
