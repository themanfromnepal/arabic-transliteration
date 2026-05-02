import { createHash } from 'node:crypto';
import { createReadStream } from 'node:fs';
import type { MergedCorpus } from '../merge';
import type { ManifestShard } from '../../../src/types/dictionary';

export type SourcePaths = {
  tanzil: string;
  qac: string;
  wbw: string;
  yusufali: string;
};

const MANIFEST_SCHEMA_VERSION = '1.0.0';

export const sha256File = (filePath: string): Promise<string> =>
  new Promise((resolve, reject) => {
    const hash = createHash('sha256');
    const stream = createReadStream(filePath);
    stream.on('error', reject);
    stream.on('data', (chunk) => hash.update(chunk));
    stream.on('end', () => resolve(hash.digest('hex')));
  });

export const buildManifest = async (
  corpus: MergedCorpus,
  sourcePaths: SourcePaths,
): Promise<ManifestShard> => {
  const [tanzil, qac, wbw, yusufali] = await Promise.all([
    sha256File(sourcePaths.tanzil),
    sha256File(sourcePaths.qac),
    sha256File(sourcePaths.wbw),
    sha256File(sourcePaths.yusufali),
  ]);
  const occurrences = corpus.lemmas.reduce((acc, l) => acc + l.occurrences.length, 0);
  return {
    schemaVersion: MANIFEST_SCHEMA_VERSION,
    sourceSha256: { tanzil, qac, wbw, yusufali },
    counts: {
      lemmas: corpus.lemmas.length,
      verses: corpus.verses.length,
      wbw: corpus.wbw.length,
      yusufali: corpus.yusufali.length,
      occurrences,
    },
  };
};
