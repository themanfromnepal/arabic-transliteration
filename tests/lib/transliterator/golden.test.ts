import { readFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { describe, it, expect } from 'vitest';
import { transliterate } from '@/src/lib/transliterator';

type GoldenEntry = {
  id: string;
  phonetic: string;
  expectedArabic: string;
  source: 'sample' | 'canonical';
};

type GoldenFixture = {
  seed: number;
  entries: GoldenEntry[];
};

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const fixturePath = path.join(__dirname, 'fixtures', 'golden.json');
const fixture = JSON.parse(readFileSync(fixturePath, 'utf8')) as GoldenFixture;

const DIACRITIC_RE = /[\u064B-\u065F\u0670\u06D6-\u06ED\u0651\u0652\u0640]/g;
const ALEF_RE = /[\u0623\u0625\u0622\u0671]/g; // أ إ آ ٱ
const YA_RE = /\u0649/g; // ى
const WS_RE = /\s+/g;

const normalizeForCompare = (s: string): string => {
  return s
    .replace(DIACRITIC_RE, '')
    .replace(ALEF_RE, '\u0627')
    .replace(YA_RE, '\u064A')
    .replace(WS_RE, ' ')
    .trim();
};

describe('transliterator golden set (Stage E)', () => {
  it('matches expected Arabic for ≥95% of entries', () => {
    const total = fixture.entries.length;
    expect(total).toBeGreaterThan(0);

    type Mismatch = {
      id: string;
      phonetic: string;
      expected: string;
      actual: string;
      expectedNorm: string;
      actualNorm: string;
    };

    const mismatches: Mismatch[] = [];
    let passing = 0;

    for (const entry of fixture.entries) {
      const actual = transliterate(entry.phonetic);
      const expectedNorm = normalizeForCompare(entry.expectedArabic);
      const actualNorm = normalizeForCompare(actual);
      if (expectedNorm === actualNorm) {
        passing += 1;
      } else {
        mismatches.push({
          id: entry.id,
          phonetic: entry.phonetic,
          expected: entry.expectedArabic,
          actual,
          expectedNorm,
          actualNorm,
        });
      }
    }

    const accuracy = passing / total;
    const pct = (accuracy * 100).toFixed(1);

    if (accuracy < 0.95) {
      const head = mismatches.slice(0, 25);
      const lines = head.map(
        (m) =>
          `  ${m.id} | phonetic=${JSON.stringify(m.phonetic)}\n    expected     = ${JSON.stringify(m.expected)}\n    actual       = ${JSON.stringify(m.actual)}\n    expectedNorm = ${JSON.stringify(m.expectedNorm)}\n    actualNorm   = ${JSON.stringify(m.actualNorm)}`,
      );
      const report =
        `golden accuracy = ${passing}/${total} (${pct}%) — below 95% threshold\n` +
        `first ${head.length} of ${mismatches.length} mismatches:\n${lines.join('\n')}`;
      // eslint-disable-next-line no-console
      console.error(report);
      throw new Error(report);
    }

    expect(accuracy).toBeGreaterThanOrEqual(0.95);
  });
});
