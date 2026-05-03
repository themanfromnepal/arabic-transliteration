export {};

import { pathToFileURL } from 'node:url';
import path from 'node:path';
import { loadSources, sourcesAvailable } from './build/parsers';
import { mergeSources } from './build/merge';
import { applyCuration } from './build/curation';
import { emitShards } from './build/emit';
import { runLicenseGate, LicenseGateError } from './build/license';
import type { GateMode, LicenseGateResult } from './build/license';
import type { ShardMeta } from '../src/types/dictionary';

type CliOptions = {
  sura: number | null;
  noCsv: boolean;
  noValidate: boolean;
  out: string;
  curationCsv: string;
  csvDryRun: boolean;
  allowPending: boolean;
  noLicenseCheck: boolean;
};

const parseArgs = (argv: string[]): CliOptions => {
  const opts: CliOptions = {
    sura: null,
    noCsv: false,
    noValidate: false,
    out: 'public/data',
    curationCsv: 'data/curation/lemmas.csv',
    csvDryRun: false,
    allowPending: false,
    noLicenseCheck: false,
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
    } else if (arg === '--allow-pending') {
      opts.allowPending = true;
    } else if (arg === '--no-license-check') {
      opts.noLicenseCheck = true;
    } else if (arg === '--help' || arg === '-h') {
      console.log(
        'Usage: tsx scripts/build-dictionary.ts [--sura <n>] [--no-csv] [--no-validate] [--out <dir>] [--curation-csv <path>] [--csv-dry-run] [--allow-pending] [--no-license-check]',
      );
      process.exit(0);
    } else {
      throw new Error(`Unknown argument: ${arg}`);
    }
  }
  if (opts.noLicenseCheck && opts.allowPending) {
    console.warn('WARNING: --no-license-check supersedes --allow-pending');
  }
  return opts;
};

/**
 * Decide whether `--no-license-check` may proceed.
 *
 * Rules (defense-in-depth so a careless flag never ships unverified data):
 *   - Requires explicit env opt-in `LICENSE_GATE_BYPASS=1`.
 *   - Forbidden in CI (`process.env.CI` truthy).
 *   - Forbidden in production (`process.env.NODE_ENV === 'production'`).
 *
 * Returns `{ ok: true }` when bypass is authorized, otherwise `{ ok: false, reason }`.
 */
export type BypassDecision = { ok: true } | { ok: false; reason: string };

export const decideLicenseBypass = (
  env: Partial<Record<string, string | undefined>>,
): BypassDecision => {
  if (env.CI) {
    return { ok: false, reason: 'license gate cannot be skipped in CI' };
  }
  if (env.NODE_ENV === 'production') {
    return {
      ok: false,
      reason: 'license gate cannot be skipped when NODE_ENV=production',
    };
  }
  if (env.LICENSE_GATE_BYPASS !== '1') {
    return {
      ok: false,
      reason:
        '--no-license-check requires LICENSE_GATE_BYPASS=1 in the environment (refused for safety)',
    };
  }
  return { ok: true };
};

const main = async (): Promise<void> => {
  const start = Date.now();
  const opts = parseArgs(process.argv.slice(2));

  console.log('build-dictionary');
  console.log(
    `  options: sura=${opts.sura ?? 'all'} noCsv=${opts.noCsv} noValidate=${opts.noValidate} out=${opts.out} curationCsv=${opts.curationCsv} csvDryRun=${opts.csvDryRun}`,
  );
  if (opts.noLicenseCheck) {
    const decision = decideLicenseBypass(process.env);
    if (!decision.ok) {
      console.error(`ERROR: ${decision.reason}`);
      process.exit(1);
    }
    console.warn(
      'WARNING: license gate bypass authorized (LICENSE_GATE_BYPASS=1) — DO NOT SHIP this build',
    );
  }
  console.log('[Stage A] (sources) — TODO');
  if (!sourcesAvailable()) {
    console.log(
      '[Stage C] data/sources/ incomplete — skipping load. Run `Get-Content data/sources/README.md` for setup.',
    );
    if (opts.noCsv) {
      console.log('[Stage D] Curation CSV round-trip... — skipped (--no-csv)');
    }
  } else {
    const mode: GateMode = opts.noLicenseCheck
      ? 'skip'
      : opts.allowPending
        ? 'allow-pending'
        : 'enforce';
    const sourcesDir = path.resolve(process.cwd(), 'data/sources');
    const manifestPath = path.resolve(process.cwd(), 'data/sources/licenses.json');
    // Gate runs BEFORE loadSources so we never parse ~7MB of corpus when the
    // gate is going to fail anyway. The gate does its own filesystem reads.
    let gateResult: LicenseGateResult;
    try {
      gateResult = await runLicenseGate({ sourcesDir, manifestPath, mode });
    } catch (err) {
      if (err instanceof LicenseGateError) {
        console.error(err.message);
        process.exit(1);
      }
      throw err;
    }
    const generatedAt = new Date().toISOString();
    const meta: ShardMeta = {
      generatedAt,
      sources: gateResult.sources,
    };

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
      meta,
    });
    console.log(`[Stage E] wrote ${written.length} shards to ${outDir}: ${written.join(' ')}`);
  }
  console.log('Done.');

  const elapsed = ((Date.now() - start) / 1000).toFixed(2);
  console.log(`Elapsed: ${elapsed}s`);
};

// Guard: only auto-run when invoked directly (e.g. via `tsx`), not when
// imported as a module from a unit test.
const invokedDirectly =
  typeof process !== 'undefined' &&
  Array.isArray(process.argv) &&
  process.argv[1] !== undefined &&
  import.meta.url === pathToFileURL(process.argv[1]).href;

if (invokedDirectly) {
  void main().catch((err) => {
    console.error(err);
    process.exit(1);
  });
}
