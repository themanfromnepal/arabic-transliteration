import { describe, it, expect } from 'vitest';
import { decideLicenseBypass } from '../../scripts/build-dictionary';

describe('decideLicenseBypass', () => {
  it('refuses when LICENSE_GATE_BYPASS is missing', () => {
    const r = decideLicenseBypass({});
    expect(r.ok).toBe(false);
    expect((r as { ok: false; reason: string }).reason).toMatch(/LICENSE_GATE_BYPASS=1/);
  });

  it('refuses when CI is truthy even with bypass set', () => {
    const r = decideLicenseBypass({ CI: 'true', LICENSE_GATE_BYPASS: '1' });
    expect(r.ok).toBe(false);
    expect((r as { ok: false; reason: string }).reason).toMatch(/CI/);
  });

  it('refuses when NODE_ENV=production even with bypass set', () => {
    const r = decideLicenseBypass({
      NODE_ENV: 'production',
      LICENSE_GATE_BYPASS: '1',
    });
    expect(r.ok).toBe(false);
    expect((r as { ok: false; reason: string }).reason).toMatch(/production/);
  });

  it('refuses when LICENSE_GATE_BYPASS is set to something other than "1"', () => {
    const r = decideLicenseBypass({ LICENSE_GATE_BYPASS: 'true' });
    expect(r.ok).toBe(false);
  });

  it('allows when LICENSE_GATE_BYPASS=1 and not CI/production', () => {
    const r = decideLicenseBypass({ LICENSE_GATE_BYPASS: '1' });
    expect(r.ok).toBe(true);
  });

  it('allows in development with explicit bypass', () => {
    const r = decideLicenseBypass({
      LICENSE_GATE_BYPASS: '1',
      NODE_ENV: 'development',
    });
    expect(r.ok).toBe(true);
  });
});
