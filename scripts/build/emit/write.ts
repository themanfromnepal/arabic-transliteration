import { promises as fs } from 'node:fs';
import path from 'node:path';
import type { MergedCorpus } from '../merge';
import type { ShardMeta } from '../../../src/types/dictionary';
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
import { buildManifest } from './manifest';

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
  meta?: ShardMeta;
};

export type EmitShardsResult = {
  written: string[];
  skippedReason?: string;
};

// Spread payload first so the gate-supplied `_meta` is authoritative even if
// a builder ever produced its own `_meta` field.
const withMeta = <T extends object>(payload: T, meta: ShardMeta | undefined): T =>
  meta === undefined ? payload : ({ ...payload, _meta: meta } as T);

export const emitShards = async (
  corpus: MergedCorpus,
  opts: EmitShardsOptions,
): Promise<EmitShardsResult> => {
  if (opts.suraFilter !== null && path.relative(opts.outDir, opts.defaultOutDir) === '') {
    throw new Error(
      `Refusing to write a partial build to the default output directory: --sura was set, but --out resolves to the default. Pass --out <dir> to redirect partial output away from public/data.`,
    );
  }

  const { meta } = opts;
  const dictionary = withMeta(buildDictionaryShard(corpus), meta);
  const verses = withMeta(buildVersesShard(corpus), meta);
  const occurrences = withMeta(buildOccurrencesShard(corpus), meta);
  const wbw = withMeta(buildWbwShard(corpus), meta);
  const yusufali = withMeta(buildTranslationsShard(corpus), meta);
  const index = withMeta(buildInlineIndexShard(corpus), meta);
  const manifest = withMeta(buildManifest(corpus), meta);

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
