import { describe, it, expect } from 'vitest';
import { existsSync, readFileSync } from 'node:fs';
import path from 'node:path';

const DICT_PATH = path.resolve(process.cwd(), 'public/data/dictionary.json');
const BUCKWALTER_RE = /[{}<>&*$~`@]/;
const ARABIC_CODEPOINT_RE = /[\u0600-\u06FF]/;

describe('data integrity', () => {
  if (!existsSync(DICT_PATH)) {
    it.skip('dictionary.json not built yet — run `npx tsx scripts/build-dictionary.ts`', () => {});
    return;
  }

  const raw = readFileSync(DICT_PATH, 'utf8');
  const parsed = JSON.parse(raw) as {
    lemmas: Array<{ lemmaId: string; arabic: string; lemma: string }>;
  };
  const lemmas = parsed.lemmas;

  it('has at least one lemma', () => {
    expect(lemmas.length).toBeGreaterThan(0);
  });

  it('arabic and lemma fields are Uthmani Arabic, not Buckwalter', () => {
    const offenders: Array<{ lemmaId: string; field: string; value: string }> = [];
    for (const l of lemmas) {
      for (const field of ['arabic', 'lemma'] as const) {
        const v = l[field];
        if (BUCKWALTER_RE.test(v) || !ARABIC_CODEPOINT_RE.test(v)) {
          offenders.push({ lemmaId: l.lemmaId, field, value: v });
        }
      }
    }
    expect(offenders.slice(0, 10)).toEqual([]);
  });
});
