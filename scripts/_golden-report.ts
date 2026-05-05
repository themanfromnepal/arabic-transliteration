import { readFileSync, writeFileSync } from 'node:fs';
import { transliterate } from '../src/lib/transliterator';

const fixture = JSON.parse(readFileSync('tests/lib/transliterator/fixtures/golden.json', 'utf8'));

const DIACRITIC_RE = /[\u064B-\u065F\u0670\u06D6-\u06ED\u0651\u0652\u0640]/g;
const ALEF_RE = /[\u0623\u0625\u0622\u0671]/g;
const YA_RE = /\u0649/g;
const WS_RE = /\s+/g;
const norm = (s: string) =>
  s
    .replace(DIACRITIC_RE, '')
    .replace(ALEF_RE, '\u0627')
    .replace(YA_RE, '\u064A')
    .replace(WS_RE, ' ')
    .trim();

const passes: any[] = [];
const fails: any[] = [];
for (const e of fixture.entries) {
  const actual = transliterate(e.phonetic);
  if (norm(actual) === norm(e.expectedArabic))
    passes.push({ id: e.id, phonetic: e.phonetic, expected: e.expectedArabic, actual });
  else
    fails.push({
      id: e.id,
      phonetic: e.phonetic,
      expected: e.expectedArabic,
      actual,
      expectedNorm: norm(e.expectedArabic),
      actualNorm: norm(actual),
    });
}

const out = {
  total: fixture.entries.length,
  passing: passes.length,
  failing: fails.length,
  pct: ((passes.length / fixture.entries.length) * 100).toFixed(1),
  firstPasses: passes.slice(0, 5),
  firstFails: fails.slice(0, 50),
};
writeFileSync('tmp/golden-report.json', JSON.stringify(out, null, 2), 'utf8');
console.log('wrote tmp/golden-report.json');
