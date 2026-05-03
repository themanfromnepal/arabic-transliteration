import { readdir, stat } from 'node:fs/promises';
import { join } from 'node:path';
import { loadManifest } from './manifest';
import { sha256File, hashesEqual } from './hash';
import type { LicenseManifest } from './schema';

export type GateMode = 'enforce' | 'allow-pending' | 'skip';

export type GateReasonCode =
  | 'missing-manifest'
  | 'malformed-manifest'
  | 'schema-error'
  | 'missing-file'
  | 'hash-mismatch'
  | 'tbd-hash'
  | 'pending'
  | 'rejected'
  | 'unknown-source';

export type GateFinding = {
  code: GateReasonCode;
  filename: string;
  detail?: string;
};

/**
 * Per-source metadata emitted into shard `_meta.sources`.
 *
 * `sha256` semantics:
 *   - In `enforce` and `allow-pending` modes, this is the *computed* digest
 *     of the source file on disk (lower-case hex), NOT the manifest value.
 *     For pending entries (manifest `sha256: "TBD"`) the digest is still
 *     computed so shipped metadata never carries the literal "TBD".
 *   - In `skip` mode no hashing is performed and `sha256` is `null`. A null
 *     value means "unverified — license/file integrity was not checked".
 */
export type GateSourceMeta = {
  name: string;
  license: string;
  sha256: string | null;
  attribution: string;
};

export type LicenseGateResult = {
  sources: GateSourceMeta[];
  warnings: GateFinding[];
};

export type RunLicenseGateOptions = {
  sourcesDir: string;
  manifestPath: string;
  mode: GateMode;
  hashFile?: (path: string) => Promise<string>;
  readDir?: (path: string) => Promise<string[]>;
};

const REASON_ORDER: GateReasonCode[] = [
  'missing-manifest',
  'malformed-manifest',
  'schema-error',
  'missing-file',
  'hash-mismatch',
  'tbd-hash',
  'pending',
  'rejected',
  'unknown-source',
];

const formatFinding = (f: GateFinding): string =>
  f.detail ? `${f.filename} (${f.detail})` : f.filename;

const formatFindings = (findings: GateFinding[]): string => {
  const grouped = new Map<GateReasonCode, GateFinding[]>();
  for (const f of findings) {
    const list = grouped.get(f.code) ?? [];
    list.push(f);
    grouped.set(f.code, list);
  }
  const lines: string[] = ['license gate failed'];
  for (const code of REASON_ORDER) {
    const list = grouped.get(code);
    if (!list || list.length === 0) continue;
    lines.push(`  ${code}: ${list.map(formatFinding).join(', ')}`);
  }
  return lines.join('\n');
};

export class LicenseGateError extends Error {
  readonly findings: GateFinding[];
  constructor(findings: GateFinding[]) {
    super(formatFindings(findings));
    this.name = 'LicenseGateError';
    this.findings = findings;
  }
}

const WARN_IN_ALLOW_PENDING: ReadonlySet<GateReasonCode> = new Set(['tbd-hash', 'pending']);

const toSourceMeta = (
  manifest: LicenseManifest,
  computedHashes: Map<string, string>,
): GateSourceMeta[] =>
  manifest.sources
    .map((e) => ({
      name: e.filename,
      license: e.license,
      sha256: computedHashes.get(e.filename) ?? null,
      attribution: e.attribution,
    }))
    .sort((a, b) => (a.name < b.name ? -1 : a.name > b.name ? 1 : 0));

const loadOrThrow = async (manifestPath: string): Promise<LicenseManifest> => {
  const loaded = await loadManifest(manifestPath);
  if (!loaded.ok) {
    const codeMap: Record<typeof loaded.code, GateReasonCode> = {
      missing: 'missing-manifest',
      malformed: 'malformed-manifest',
      schema: 'schema-error',
    };
    throw new LicenseGateError([
      { code: codeMap[loaded.code], filename: '', detail: loaded.detail },
    ]);
  }
  return loaded.value;
};

export const runLicenseGate = async (opts: RunLicenseGateOptions): Promise<LicenseGateResult> => {
  const hashFile = opts.hashFile ?? sha256File;
  const readDir = opts.readDir ?? ((p: string) => readdir(p));

  if (opts.mode === 'skip') {
    console.warn('WARNING: license check disabled (dev only — DO NOT SHIP)');
    // skip suspends file/status verification but NOT manifest schema
    // validation: a missing or malformed manifest is a hard failure even in
    // skip mode so we never ship empty/garbage `_meta.sources` to clients.
    const manifest = await loadOrThrow(opts.manifestPath);
    return { sources: toSourceMeta(manifest, new Map()), warnings: [] };
  }

  const manifest = await loadOrThrow(opts.manifestPath);
  const findings: GateFinding[] = [];
  const computedHashes = new Map<string, string>();

  for (const entry of manifest.sources) {
    const filePath = join(opts.sourcesDir, entry.filename);
    let present = true;
    try {
      await stat(filePath);
    } catch (err) {
      if ((err as NodeJS.ErrnoException).code === 'ENOENT') {
        present = false;
        findings.push({ code: 'missing-file', filename: entry.filename });
      } else {
        throw err;
      }
    }

    if (present) {
      if (entry.sha256 === 'TBD') {
        findings.push({ code: 'tbd-hash', filename: entry.filename });
        // Compute anyway so downstream `_meta.sources` carries the real
        // digest (allow-pending may downgrade tbd-hash to a warning).
        computedHashes.set(entry.filename, await hashFile(filePath));
      } else {
        const actual = await hashFile(filePath);
        computedHashes.set(entry.filename, actual);
        if (!hashesEqual(actual, entry.sha256)) {
          findings.push({
            code: 'hash-mismatch',
            filename: entry.filename,
            detail: `expected=${entry.sha256} actual=${actual}`,
          });
        }
      }
    }

    if (entry.status === 'pending') {
      findings.push({ code: 'pending', filename: entry.filename });
    } else if (entry.status === 'rejected') {
      findings.push({ code: 'rejected', filename: entry.filename });
    }
  }

  const manifestFilenames = new Set(manifest.sources.map((e) => e.filename));
  const dirEntries = await readDir(opts.sourcesDir);
  for (const name of dirEntries) {
    if (name === 'licenses.json') continue;
    if (!(name.endsWith('.txt') || name.endsWith('.json'))) continue;
    if (!manifestFilenames.has(name)) {
      findings.push({ code: 'unknown-source', filename: name });
    }
  }

  const failures: GateFinding[] = [];
  const warnings: GateFinding[] = [];
  for (const f of findings) {
    if (opts.mode === 'allow-pending' && WARN_IN_ALLOW_PENDING.has(f.code)) {
      warnings.push(f);
    } else {
      failures.push(f);
    }
  }

  if (failures.length > 0) {
    throw new LicenseGateError(failures);
  }

  const count = manifest.sources.length;
  const sourceWord = count === 1 ? 'source' : 'sources';
  if (warnings.length > 0) {
    const uniqueWarn = new Set(warnings.map((w) => w.filename)).size;
    const warnWord = uniqueWarn === 1 ? 'warning' : 'warnings';
    console.log(
      `[Stage F] license gate passed with ${uniqueWarn} ${warnWord} (${count} ${sourceWord} verified)`,
    );
    const unique = Array.from(new Set(warnings.map((w) => w.filename)));
    console.warn(`WARNING: building with pending licenses: ${unique.join(', ')}`);
  } else {
    console.log(`[Stage F] license gate passed (${count} ${sourceWord} verified)`);
  }

  return { sources: toSourceMeta(manifest, computedHashes), warnings };
};
