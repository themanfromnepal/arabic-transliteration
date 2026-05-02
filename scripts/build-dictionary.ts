export {};

import path from 'node:path';
import { loadSources, sourcesAvailable, SOURCE_PATHS } from './build/parsers';
import { mergeSources } from './build/merge';
import { applyCuration } from './build/curation';
import { emitShards } from './build/emit';

type CliOptions = {
  sura: number | null;
  noCsv: boolean;
  noValidate: boolean;
  out: string;
  curationCsv: string;
  csvDryRun: boolean;
};

const parseArgs = (argv: string[]): CliOptions => {
  const opts: CliOptions = {
    sura: null,
    noCsv: false,
    noValidate: false,
    out: 'public/data',
    curationCsv: 'data/curation/lemmas.csv',
    csvDryRun: false,
  };
  for (let i = 0; i < argv.length; i++) {
    const arg = argv[i];
    if (arg === '--sura') {
      const next = argv[++i];
      if (!next) throw new Error('--sura requires a value');
      const n = Number.parseInt(next, 10);
      if (!Number.isInteger(n) || n < 1 || n > 114) {
        throw new Error(`--sura must be an integer 1..114, got: ${next}`);
      }
      opts.sura = n;
    } else if (arg === '--no-csv') {
      opts.noCsv = true;
    } else if (arg === '--no-validate') {
      opts.noValidate = true;
    } else if (arg === '--out') {
      const next = argv[++i];
      if (!next) throw new Error('--out requires a value');
      opts.out = next;
    } else if (arg === '--curation-csv') {
      const next = argv[++i];
      if (!next) throw new Error('--curation-csv requires a value');
      opts.curationCsv = next;
    } else if (arg === '--csv-dry-run') {
      opts.csvDryRun = true;
    } else if (arg === '--help' || arg === '-h') {
      console.log(
        'Usage: tsx scripts/build-dictionary.ts [--sura <n>] [--no-csv] [--no-validate] [--out <dir>] [--curation-csv <path>] [--csv-dry-run]',
      );
      process.exit(0);
    } else {
      throw new Error(`Unknown argument: ${arg}`);
    }
  }
  return opts;
};

const main = async (): Promise<void> => {
  const start = Date.now();
  const opts = parseArgs(process.argv.slice(2));

  console.log('build-dictionary');
  console.log(
    `  options: sura=${opts.sura ?? 'all'} noCsv=${opts.noCsv} noValidate=${opts.noValidate} out=${opts.out} curationCsv=${opts.curationCsv} csvDryRun=${opts.csvDryRun}`,
  );
  console.log('[Stage A] (sources) — TODO');
  if (!sourcesAvailable()) {
    console.log(
      '[Stage C] data/sources/ incomplete — skipping load. Run `Get-Content data/sources/README.md` for setup.',
    );
    if (opts.noCsv) {
      console.log('[Stage D] Curation CSV round-trip... — skipped (--no-csv)');
    }
  } else {
    const loaded = await loadSources();
    let { verses, qacTokens, wbw, yusufali } = loaded;
    console.log(
      `[Stage C] verses=${verses.length} qacTokens=${qacTokens.length} wbw=${wbw.length} yusufali=${yusufali.length}`,
    );
    if (opts.sura !== null) {
      const s = opts.sura;
      verses = verses.filter((v) => v.sura === s);
      qacTokens = qacTokens.filter((t) => t.sura === s);
      wbw = wbw.filter((w) => w.sura === s);
      yusufali = yusufali.filter((y) => y.sura === s);
      console.log(
        `[Stage C] (--sura ${s}) verses=${verses.length} qacTokens=${qacTokens.length} wbw=${wbw.length} yusufali=${yusufali.length}`,
      );
    }
    const merged = mergeSources(
      { verses, qacTokens, wbw, yusufali },
      { validate: !opts.noValidate },
    );
    console.log(
      `[Stage C] lemmas=${merged.stats.lemmas} occurrences=${merged.stats.occurrences} skippedTokens=${merged.stats.skippedTokens}`,
    );

    if (opts.noCsv) {
      console.log('[Stage D] Curation CSV round-trip... — skipped (--no-csv)');
    } else {
      if (opts.sura !== null) {
        console.log('[Stage D] csv: --sura mode, in-memory only');
      }
      const r = await applyCuration(merged, {
        csvPath: opts.curationCsv,
        dryRun: opts.csvDryRun,
        suraFilter: opts.sura,
      });
      const suffix = opts.sura !== null ? ' (in-memory only)' : opts.csvDryRun ? ' (dry-run)' : '';
      console.log(
        `[Stage D] csv: +${r.added} new, ${r.edits} edits applied, ${r.orphaned} orphaned${suffix}`,
      );
      if (r.readOnlyEditWarnings.length > 0) {
        const max = 20;
        const shown = r.readOnlyEditWarnings.slice(0, max);
        const extra = r.readOnlyEditWarnings.length - shown.length;
        const tail = extra > 0 ? `, ...+${extra} more` : '';
        console.warn(
          `[Stage D] warning: read-only column edits detected for: ${shown.join(', ')}${tail}`,
        );
      }
    }

    const defaultOutDir = path.resolve(process.cwd(), 'public/data');
    const outDir = path.resolve(opts.out);
    const { written } = await emitShards(merged, {
      outDir,
      validate: !opts.noValidate,
      suraFilter: opts.sura,
      defaultOutDir,
      sourcePaths: SOURCE_PATHS,
    });
    console.log(`[Stage E] wrote ${written.length} shards to ${outDir}: ${written.join(' ')}`);
  }
  console.log('Done.');

  const elapsed = ((Date.now() - start) / 1000).toFixed(2);
  console.log(`Elapsed: ${elapsed}s`);
};

void main().catch((err) => {
  console.error(err);
  process.exit(1);
});
