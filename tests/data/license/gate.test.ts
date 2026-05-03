import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { mkdtemp, rm, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import {
  runLicenseGate,
  LicenseGateError,
  type GateMode,
  type RunLicenseGateOptions,
} from '../../../scripts/build/license/gate';

const HELLO_SHA = '2cf24dba5fb0a30e26e83b2ac5b9e29e1b161e5c1fa7425e73043362938b9824';
const REAL_HEX_A = 'a'.repeat(64);

let tmpDir: string;
let sourcesDir: string;
let manifestPath: string;

const writeManifest = async (manifest: unknown): Promise<void> => {
  await writeFile(manifestPath, JSON.stringify(manifest), 'utf8');
};

const baseEntry = (overrides: Record<string, unknown> = {}) => ({
  filename: 'foo.txt',
  license: 'MIT',
  status: 'approved',
  sha256: 'TBD',
  attribution: 'someone',
  ...overrides,
});

const runOpts = (overrides: Partial<RunLicenseGateOptions> = {}): RunLicenseGateOptions => ({
  sourcesDir,
  manifestPath,
  mode: 'enforce',
  readDir: async () => [],
  ...overrides,
});

beforeEach(async () => {
  tmpDir = await mkdtemp(join(tmpdir(), 'license-gate-'));
  sourcesDir = join(tmpDir, 'sources');
  manifestPath = join(tmpDir, 'licenses.json');
  await writeFile(join(tmpDir, '.keep'), '', 'utf8');
  // sourcesDir created on demand
  await writeFile(join(tmpDir, '.keep2'), '', 'utf8');
});

afterEach(async () => {
  await rm(tmpDir, { recursive: true, force: true });
  vi.restoreAllMocks();
});

const ensureSourcesDir = async () => {
  const { mkdir } = await import('node:fs/promises');
  await mkdir(sourcesDir, { recursive: true });
};

describe('runLicenseGate — happy path', () => {
  it('enforce: real file with matching sha256 passes', async () => {
    await ensureSourcesDir();
    await writeFile(join(sourcesDir, 'hello.txt'), 'hello', 'utf8');
    await writeManifest({
      version: 1,
      sources: [baseEntry({ filename: 'hello.txt', sha256: HELLO_SHA, status: 'approved' })],
    });
    const log = vi.spyOn(console, 'log').mockImplementation(() => {});
    const result = await runLicenseGate({
      sourcesDir,
      manifestPath,
      mode: 'enforce',
      readDir: async () => ['hello.txt'],
    });
    expect(result.warnings).toEqual([]);
    expect(result.sources).toEqual([
      {
        name: 'hello.txt',
        license: 'MIT',
        sha256: HELLO_SHA,
        attribution: 'someone',
      },
    ]);
    expect(log).toHaveBeenCalledWith('[Stage F] license gate passed (1 source verified)');
  });
});

describe('runLicenseGate — manifest load errors', () => {
  it('E1 missing manifest (enforce)', async () => {
    const err = await runLicenseGate(runOpts({ mode: 'enforce' })).catch((e) => e);
    expect(err).toBeInstanceOf(LicenseGateError);
    expect((err as LicenseGateError).findings[0]!.code).toBe('missing-manifest');
  });

  it('E1 missing manifest (allow-pending)', async () => {
    const err = await runLicenseGate(runOpts({ mode: 'allow-pending' })).catch((e) => e);
    expect(err).toBeInstanceOf(LicenseGateError);
    expect((err as LicenseGateError).findings[0]!.code).toBe('missing-manifest');
  });

  it('E2 malformed manifest (both modes)', async () => {
    await writeFile(manifestPath, 'not json', 'utf8');
    for (const mode of ['enforce', 'allow-pending'] as GateMode[]) {
      const err = await runLicenseGate(runOpts({ mode })).catch((e) => e);
      expect(err).toBeInstanceOf(LicenseGateError);
      expect((err as LicenseGateError).findings[0]!.code).toBe('malformed-manifest');
    }
  });

  it('E3 schema error (both modes)', async () => {
    await writeFile(manifestPath, JSON.stringify({ version: 1, sources: [] }), 'utf8');
    for (const mode of ['enforce', 'allow-pending'] as GateMode[]) {
      const err = await runLicenseGate(runOpts({ mode })).catch((e) => e);
      expect(err).toBeInstanceOf(LicenseGateError);
      expect((err as LicenseGateError).findings[0]!.code).toBe('schema-error');
    }
  });
});

describe('runLicenseGate — per-entry checks', () => {
  it('E4 missing-file fails in both modes', async () => {
    await writeManifest({
      version: 1,
      sources: [baseEntry({ filename: 'absent.txt', sha256: HELLO_SHA, status: 'approved' })],
    });
    for (const mode of ['enforce', 'allow-pending'] as GateMode[]) {
      const err = await runLicenseGate(runOpts({ mode, readDir: async () => [] })).catch((e) => e);
      expect(err).toBeInstanceOf(LicenseGateError);
      const codes = (err as LicenseGateError).findings.map((f) => f.code);
      expect(codes).toContain('missing-file');
    }
  });

  it('E5 hash-mismatch fails in both modes with detail', async () => {
    await ensureSourcesDir();
    await writeFile(join(sourcesDir, 'foo.txt'), 'content', 'utf8');
    await writeManifest({
      version: 1,
      sources: [baseEntry({ filename: 'foo.txt', sha256: REAL_HEX_A, status: 'approved' })],
    });
    for (const mode of ['enforce', 'allow-pending'] as GateMode[]) {
      const err = await runLicenseGate(
        runOpts({
          mode,
          hashFile: async () => 'b'.repeat(64),
          readDir: async () => ['foo.txt'],
        }),
      ).catch((e) => e);
      expect(err).toBeInstanceOf(LicenseGateError);
      const finding = (err as LicenseGateError).findings.find((f) => f.code === 'hash-mismatch');
      expect(finding).toBeDefined();
      expect(finding!.detail).toContain('expected=');
      expect(finding!.detail).toContain('actual=');
    }
  });

  it('E6 tbd-hash fails in enforce', async () => {
    await ensureSourcesDir();
    await writeFile(join(sourcesDir, 'foo.txt'), 'x', 'utf8');
    await writeManifest({
      version: 1,
      sources: [baseEntry({ filename: 'foo.txt', sha256: 'TBD', status: 'approved' })],
    });
    const err = await runLicenseGate(
      runOpts({ mode: 'enforce', readDir: async () => ['foo.txt'] }),
    ).catch((e) => e);
    expect(err).toBeInstanceOf(LicenseGateError);
    expect((err as LicenseGateError).findings.map((f) => f.code)).toContain('tbd-hash');
  });

  it('E6 tbd-hash warns in allow-pending', async () => {
    await ensureSourcesDir();
    await writeFile(join(sourcesDir, 'foo.txt'), 'x', 'utf8');
    await writeManifest({
      version: 1,
      sources: [baseEntry({ filename: 'foo.txt', sha256: 'TBD', status: 'approved' })],
    });
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => {});
    vi.spyOn(console, 'log').mockImplementation(() => {});
    const result = await runLicenseGate(
      runOpts({ mode: 'allow-pending', readDir: async () => ['foo.txt'] }),
    );
    expect(result.warnings.map((w) => w.code)).toEqual(['tbd-hash']);
    expect(warn).toHaveBeenCalledWith('WARNING: building with pending licenses: foo.txt');
    // Critical 1: even with TBD in the manifest, _meta.sources must carry
    // the *computed* digest, never the literal "TBD".
    const xSha = '2d711642b726b04401627ca9fbac32f5c8530fb1903cc4db02258717921a4881';
    expect(result.sources[0]!.sha256).toBe(xSha);
  });

  it('E7 pending fails in enforce', async () => {
    await ensureSourcesDir();
    await writeFile(join(sourcesDir, 'foo.txt'), 'hello', 'utf8');
    await writeManifest({
      version: 1,
      sources: [baseEntry({ filename: 'foo.txt', sha256: HELLO_SHA, status: 'pending' })],
    });
    const err = await runLicenseGate(
      runOpts({ mode: 'enforce', readDir: async () => ['foo.txt'] }),
    ).catch((e) => e);
    expect(err).toBeInstanceOf(LicenseGateError);
    expect((err as LicenseGateError).findings.map((f) => f.code)).toContain('pending');
  });

  it('E7 pending warns in allow-pending', async () => {
    await ensureSourcesDir();
    await writeFile(join(sourcesDir, 'foo.txt'), 'hello', 'utf8');
    await writeManifest({
      version: 1,
      sources: [baseEntry({ filename: 'foo.txt', sha256: HELLO_SHA, status: 'pending' })],
    });
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => {});
    const log = vi.spyOn(console, 'log').mockImplementation(() => {});
    const result = await runLicenseGate(
      runOpts({ mode: 'allow-pending', readDir: async () => ['foo.txt'] }),
    );
    expect(result.warnings.map((w) => w.code)).toEqual(['pending']);
    expect(warn).toHaveBeenCalledWith('WARNING: building with pending licenses: foo.txt');
    // Important 4: success log surfaces the warning count.
    expect(log).toHaveBeenCalledWith(
      '[Stage F] license gate passed with 1 warning (1 source verified)',
    );
  });

  it('E8 rejected fails in BOTH modes', async () => {
    await ensureSourcesDir();
    await writeFile(join(sourcesDir, 'foo.txt'), 'hello', 'utf8');
    await writeManifest({
      version: 1,
      sources: [baseEntry({ filename: 'foo.txt', sha256: HELLO_SHA, status: 'rejected' })],
    });
    for (const mode of ['enforce', 'allow-pending'] as GateMode[]) {
      const err = await runLicenseGate(runOpts({ mode, readDir: async () => ['foo.txt'] })).catch(
        (e) => e,
      );
      expect(err).toBeInstanceOf(LicenseGateError);
      expect((err as LicenseGateError).findings.map((f) => f.code)).toContain('rejected');
    }
  });
});

describe('runLicenseGate — directory scan', () => {
  it('E9 unknown-source fails in both modes', async () => {
    await ensureSourcesDir();
    await writeFile(join(sourcesDir, 'a.json'), '{}', 'utf8');
    await writeFile(join(sourcesDir, 'b.json'), '{}', 'utf8');
    await writeFile(join(sourcesDir, 'c.json'), '{}', 'utf8');
    await writeManifest({
      version: 1,
      sources: [
        baseEntry({ filename: 'a.json', sha256: HELLO_SHA, status: 'approved' }),
        baseEntry({ filename: 'b.json', sha256: HELLO_SHA, status: 'approved' }),
      ],
    });
    for (const mode of ['enforce', 'allow-pending'] as GateMode[]) {
      const err = await runLicenseGate(
        runOpts({
          mode,
          hashFile: async () => HELLO_SHA,
          readDir: async () => ['a.json', 'b.json', 'c.json'],
        }),
      ).catch((e) => e);
      expect(err).toBeInstanceOf(LicenseGateError);
      const unknown = (err as LicenseGateError).findings.filter((f) => f.code === 'unknown-source');
      expect(unknown).toHaveLength(1);
      expect(unknown[0]!.filename).toBe('c.json');
    }
  });

  it('E9 ignores README.md and licenses.json', async () => {
    await ensureSourcesDir();
    await writeFile(join(sourcesDir, 'a.json'), '{}', 'utf8');
    await writeManifest({
      version: 1,
      sources: [baseEntry({ filename: 'a.json', sha256: HELLO_SHA, status: 'approved' })],
    });
    vi.spyOn(console, 'log').mockImplementation(() => {});
    const result = await runLicenseGate(
      runOpts({
        mode: 'enforce',
        hashFile: async () => HELLO_SHA,
        readDir: async () => ['a.json', 'README.md', 'licenses.json'],
      }),
    );
    expect(result.warnings).toEqual([]);
    expect(result.sources.map((s) => s.name)).toEqual(['a.json']);
  });
});

describe('runLicenseGate — skip mode', () => {
  it('manifest present: populates sources with sha256=null and does not invoke hashFile', async () => {
    await writeManifest({
      version: 1,
      sources: [
        baseEntry({ filename: 'b.json', sha256: HELLO_SHA, status: 'approved' }),
        baseEntry({ filename: 'a.json', sha256: HELLO_SHA, status: 'pending' }),
      ],
    });
    const hashFile = vi.fn(async () => HELLO_SHA);
    const readDir = vi.fn(async () => ['nope.json']);
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => {});
    const result = await runLicenseGate({
      sourcesDir,
      manifestPath,
      mode: 'skip',
      hashFile,
      readDir,
    });
    expect(hashFile).not.toHaveBeenCalled();
    expect(readDir).not.toHaveBeenCalled();
    expect(result.warnings).toEqual([]);
    expect(result.sources.map((s) => s.name)).toEqual(['a.json', 'b.json']);
    // Skip mode: sha256 must be null (unverified) so we never ship the
    // manifest's literal value (which could be "TBD").
    expect(result.sources.every((s) => s.sha256 === null)).toBe(true);
    expect(warn).toHaveBeenCalledWith('WARNING: license check disabled (dev only — DO NOT SHIP)');
  });

  it('manifest missing: hard-fails (skip does not bypass schema validation)', async () => {
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => {});
    const err = await runLicenseGate({
      sourcesDir,
      manifestPath,
      mode: 'skip',
    }).catch((e) => e);
    expect(err).toBeInstanceOf(LicenseGateError);
    expect((err as LicenseGateError).findings[0]!.code).toBe('missing-manifest');
    expect(warn).toHaveBeenCalledWith('WARNING: license check disabled (dev only — DO NOT SHIP)');
  });

  it('manifest malformed: hard-fails in skip mode', async () => {
    await writeFile(manifestPath, '{not valid json', 'utf8');
    vi.spyOn(console, 'warn').mockImplementation(() => {});
    const err = await runLicenseGate({
      sourcesDir,
      manifestPath,
      mode: 'skip',
    }).catch((e) => e);
    expect(err).toBeInstanceOf(LicenseGateError);
    expect((err as LicenseGateError).findings[0]!.code).toBe('malformed-manifest');
  });

  it('manifest schema-invalid: hard-fails in skip mode', async () => {
    await writeFile(manifestPath, JSON.stringify({ version: 1, sources: [] }), 'utf8');
    vi.spyOn(console, 'warn').mockImplementation(() => {});
    const err = await runLicenseGate({
      sourcesDir,
      manifestPath,
      mode: 'skip',
    }).catch((e) => e);
    expect(err).toBeInstanceOf(LicenseGateError);
    expect((err as LicenseGateError).findings[0]!.code).toBe('schema-error');
  });
});

describe('runLicenseGate — error grouping & sorting', () => {
  it('groups multiple findings by reason code in deterministic order', async () => {
    await ensureSourcesDir();
    // entry 1: present, pending, valid hash
    await writeFile(join(sourcesDir, 'a.json'), 'x', 'utf8');
    // entry 2: present, approved, TBD hash → tbd-hash
    await writeFile(join(sourcesDir, 'b.json'), 'x', 'utf8');
    // entry 3: missing-file
    // entry 4: present, pending, TBD hash → tbd-hash + pending
    await writeFile(join(sourcesDir, 'd.json'), 'x', 'utf8');
    await writeManifest({
      version: 1,
      sources: [
        baseEntry({ filename: 'a.json', sha256: HELLO_SHA, status: 'pending' }),
        baseEntry({ filename: 'b.json', sha256: 'TBD', status: 'approved' }),
        baseEntry({ filename: 'c.json', sha256: HELLO_SHA, status: 'approved' }),
        baseEntry({ filename: 'd.json', sha256: 'TBD', status: 'pending' }),
      ],
    });
    const err = await runLicenseGate(
      runOpts({
        mode: 'enforce',
        hashFile: async () => HELLO_SHA,
        readDir: async () => ['a.json', 'b.json', 'd.json'],
      }),
    ).catch((e) => e);
    expect(err).toBeInstanceOf(LicenseGateError);
    const msg = (err as LicenseGateError).message;
    expect(msg).toContain('license gate failed');
    expect(msg).toContain('missing-file: c.json');
    expect(msg).toContain('tbd-hash: b.json, d.json');
    expect(msg).toContain('pending: a.json, d.json');
    // Deterministic order: missing-file before tbd-hash before pending
    const idxMissing = msg.indexOf('missing-file');
    const idxTbd = msg.indexOf('tbd-hash');
    const idxPending = msg.indexOf('pending:');
    expect(idxMissing).toBeLessThan(idxTbd);
    expect(idxTbd).toBeLessThan(idxPending);
  });

  it('sources are sorted by name ascending', async () => {
    await ensureSourcesDir();
    await writeFile(join(sourcesDir, 'z.json'), 'x', 'utf8');
    await writeFile(join(sourcesDir, 'a.json'), 'x', 'utf8');
    await writeFile(join(sourcesDir, 'm.json'), 'x', 'utf8');
    await writeManifest({
      version: 1,
      sources: [
        baseEntry({ filename: 'z.json', sha256: HELLO_SHA, status: 'approved' }),
        baseEntry({ filename: 'a.json', sha256: HELLO_SHA, status: 'approved' }),
        baseEntry({ filename: 'm.json', sha256: HELLO_SHA, status: 'approved' }),
      ],
    });
    vi.spyOn(console, 'log').mockImplementation(() => {});
    const result = await runLicenseGate(
      runOpts({
        mode: 'enforce',
        hashFile: async () => HELLO_SHA,
        readDir: async () => ['z.json', 'a.json', 'm.json'],
      }),
    );
    expect(result.sources.map((s) => s.name)).toEqual(['a.json', 'm.json', 'z.json']);
  });
});
