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
  buildTranslationShardsBySura,
  buildVerseShardsBySura,
  buildWbwShard,
} from './shards';
import { buildManifest } from './manifest';

export const SHARD_VERSION = '1.0.0';

/** Fixed, single-file shards — unaffected by B5's per-sura split (verses/yusufali below). */
export const KNOWN_SHARD_FILES = [
  'dictionary.json',
  'index.json',
  'manifest.json',
  'occurrences.json',
  'wbw.json',
] as const;

/**
 * Per-sura shard directories (B5 in phase-4-ui-stages.md). Each holds up to 114 files named
 * `<sura zero-padded to 3 digits>.json` — one per sura present in the corpus, so a `--sura`-filtered
 * partial build writes exactly one file per directory instead of all 114.
 */
export const SHARDED_DIRS = ['verses', 'yusufali'] as const;

/**
 * Filenames this pipeline no longer writes, cleaned up defensively so a checkout that built shards
 * before the B5 split doesn't leave the pre-migration monolithic files sitting next to the new
 * per-sura directories (`public/data` is gitignored, so nothing removes a stale local build on its
 * own — a fresh clone never has this problem, but an existing working copy can).
 */
const LEGACY_SHARD_FILES = ['verses.json', 'yusufali.json'] as const;

const suraFileName = (sura: number): string => `${String(sura).padStart(3, '0')}.json`;

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
  const occurrences = withMeta(buildOccurrencesShard(corpus), meta);
  const wbw = withMeta(buildWbwShard(corpus), meta);
  const index = withMeta(buildInlineIndexShard(corpus), meta);
  const manifest = withMeta(buildManifest(corpus), meta);

  const shards: Record<(typeof KNOWN_SHARD_FILES)[number], unknown> = {
    'dictionary.json': dictionary,
    'index.json': index,
    'manifest.json': manifest,
    'occurrences.json': occurrences,
    'wbw.json': wbw,
  };

  // Sorted so `written` — and therefore file-write order — is deterministic regardless of the
  // corpus's original verse/translation ordering.
  const verseShards = [...buildVerseShardsBySura(corpus)]
    .sort(([a], [b]) => a - b)
    .map(([sura, shard]) => [sura, withMeta(shard, meta)] as const);
  const translationShards = [...buildTranslationShardsBySura(corpus)]
    .sort(([a], [b]) => a - b)
    .map(([sura, shard]) => [sura, withMeta(shard, meta)] as const);

  if (opts.validate) {
    DictionaryShardSchema.parse(shards['dictionary.json']);
    InlineIndexShardSchema.parse(shards['index.json']);
    ManifestShardSchema.parse(shards['manifest.json']);
    OccurrencesShardSchema.parse(shards['occurrences.json']);
    WbwShardSchema.parse(shards['wbw.json']);
    for (const [, shard] of verseShards) VersesShardSchema.parse(shard);
    for (const [, shard] of translationShards) TranslationsShardSchema.parse(shard);
  }

  await fs.mkdir(opts.outDir, { recursive: true });
  for (const name of KNOWN_SHARD_FILES) {
    await fs.rm(path.join(opts.outDir, name), { force: true });
  }
  for (const name of LEGACY_SHARD_FILES) {
    await fs.rm(path.join(opts.outDir, name), { force: true });
  }
  // Full wipe-and-recreate rather than per-file removal: a sura count change (or a rename) must
  // never leave an orphaned stale file sitting alongside the fresh set.
  for (const dir of SHARDED_DIRS) {
    await fs.rm(path.join(opts.outDir, dir), { recursive: true, force: true });
  }

  const written: string[] = [];
  for (const name of KNOWN_SHARD_FILES) {
    const filePath = path.join(opts.outDir, name);
    await fs.writeFile(filePath, canonicalStringify(shards[name]), 'utf8');
    written.push(name);
  }

  if (verseShards.length > 0) {
    await fs.mkdir(path.join(opts.outDir, 'verses'), { recursive: true });
  }
  for (const [sura, shard] of verseShards) {
    const relPath = `verses/${suraFileName(sura)}`;
    await fs.writeFile(path.join(opts.outDir, relPath), canonicalStringify(shard), 'utf8');
    written.push(relPath);
  }

  if (translationShards.length > 0) {
    await fs.mkdir(path.join(opts.outDir, 'yusufali'), { recursive: true });
  }
  for (const [sura, shard] of translationShards) {
    const relPath = `yusufali/${suraFileName(sura)}`;
    await fs.writeFile(path.join(opts.outDir, relPath), canonicalStringify(shard), 'utf8');
    written.push(relPath);
  }

  return { written };
};
