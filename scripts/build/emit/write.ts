import { promises as fs } from 'node:fs';
import path from 'node:path';
import type { MergedCorpus } from '../merge';
import { canonicalStringify } from '../json-writer';
import {
  DictionaryShardSchema,
  InlineIndexShardSchema,
  ManifestShardSchema,
  OccurrencesShardSchema,
  TranslationsShardSchema,
  VersesShardSchema,
  WbwShardSchema,
} from '../schema';
import {
  buildDictionaryShard,
  buildInlineIndexShard,
  buildOccurrencesShard,
  buildTranslationsShard,
  buildVersesShard,
  buildWbwShard,
} from './shards';
import { buildManifest, type SourcePaths } from './manifest';

export const SHARD_VERSION = '1.0.0';

export const KNOWN_SHARD_FILES = [
  'dictionary.json',
  'index.json',
  'manifest.json',
  'occurrences.json',
  'verses.json',
  'wbw.json',
  'yusufali.json',
] as const;

export type EmitShardsOptions = {
  outDir: string;
  validate: boolean;
  suraFilter: number | null;
  defaultOutDir: string;
  sourcePaths: SourcePaths;
};

export type EmitShardsResult = {
  written: string[];
  skippedReason?: string;
};

export const emitShards = async (
  corpus: MergedCorpus,
  opts: EmitShardsOptions,
): Promise<EmitShardsResult> => {
  if (opts.suraFilter !== null && path.relative(opts.outDir, opts.defaultOutDir) === '') {
    throw new Error(
      `Refusing to write a partial build to the default output directory: --sura was set, but --out resolves to the default. Pass --out <dir> to redirect partial output away from public/data.`,
    );
  }

  const dictionary = buildDictionaryShard(corpus);
  const verses = buildVersesShard(corpus);
  const occurrences = buildOccurrencesShard(corpus);
  const wbw = buildWbwShard(corpus);
  const yusufali = buildTranslationsShard(corpus);
  const index = buildInlineIndexShard(corpus);
  const manifest = await buildManifest(corpus, opts.sourcePaths);

  const shards: Record<(typeof KNOWN_SHARD_FILES)[number], unknown> = {
    'dictionary.json': dictionary,
    'index.json': index,
    'manifest.json': manifest,
    'occurrences.json': occurrences,
    'verses.json': verses,
    'wbw.json': wbw,
    'yusufali.json': yusufali,
  };

  if (opts.validate) {
    DictionaryShardSchema.parse(shards['dictionary.json']);
    InlineIndexShardSchema.parse(shards['index.json']);
    ManifestShardSchema.parse(shards['manifest.json']);
    OccurrencesShardSchema.parse(shards['occurrences.json']);
    VersesShardSchema.parse(shards['verses.json']);
    WbwShardSchema.parse(shards['wbw.json']);
    TranslationsShardSchema.parse(shards['yusufali.json']);
  }

  await fs.mkdir(opts.outDir, { recursive: true });
  for (const name of KNOWN_SHARD_FILES) {
    await fs.rm(path.join(opts.outDir, name), { force: true });
  }

  const written: string[] = [];
  for (const name of KNOWN_SHARD_FILES) {
    const filePath = path.join(opts.outDir, name);
    await fs.writeFile(filePath, canonicalStringify(shards[name]), 'utf8');
    written.push(name);
  }

  return { written };
};
