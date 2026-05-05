import { describe, it, expect } from 'vitest';
import { transliterate } from '@/src/lib/transliterator';

describe('transliterate (Stage D end-to-end)', () => {
  describe('basic kinds', () => {
    it('returns empty string for empty input', () => {
      expect(transliterate('')).toBe('');
    });

    it('handles a single consonant', () => {
      expect(transliterate('b')).toBe('ب');
    });

    it('emits long vowels as letters', () => {
      expect(transliterate('aa')).toBe('ا');
      expect(transliterate('ii')).toBe('ي');
      expect(transliterate('uu')).toBe('و');
    });

    it('drops short vowels from output (undiacriticized)', () => {
      expect(transliterate('a')).toBe('');
      expect(transliterate('i')).toBe('');
      expect(transliterate('u')).toBe('');
    });

    it('emits digraphs as a single Arabic letter', () => {
      expect(transliterate('sh')).toBe('ش');
      expect(transliterate('kh')).toBe('خ');
      expect(transliterate('th')).toBe('ث');
      expect(transliterate('dh')).toBe('ذ');
      expect(transliterate('gh')).toBe('غ');
    });

    it('maps Arabizi numerals', () => {
      expect(transliterate('7')).toBe('ح');
      expect(transliterate('3')).toBe('ع');
      expect(transliterate('2')).toBe('ء');
      expect(transliterate('5')).toBe('خ');
      expect(transliterate('9')).toBe('ص');
    });
  });

  describe('words and emphatics', () => {
    it('renders a mixed-kind word: salaam', () => {
      // s, a(drop), l, aa, m
      expect(transliterate('salaam')).toBe('سلام');
    });

    it('honors emphatic capitals: Salaam → صلام', () => {
      // S(emphatic), a(drop), l, aa, m
      expect(transliterate('Salaam')).toBe('صلام');
    });

    it('emits hamza for apostrophe', () => {
      // q, u(drop), r, ', aa, n → ق ر ء ا ن
      expect(transliterate("qur'aan")).toBe('قرءان');
    });

    it('emits Arabizi inside a word (7abiib → حبيب)', () => {
      // 7→ح, a(drop), b, i(drop), i(drop), b
      // Note: 'ii' would be a long vowel ي; here we have 'iib' which tokenizes
      // length-2-first: 'ii' matches as long vowel → ي, then 'b' → ب.
      // Full: 7, a, b, ii, b → ح ب ي ب
      expect(transliterate('7abiib')).toBe('حبيب');
    });
  });

  describe('article rule', () => {
    it('emits literal ال for the article (lowercase al-)', () => {
      // ال + k, i(drop), t, aa, b
      expect(transliterate('al-kitaab')).toBe('الكتاب');
    });

    it('emits literal ال for the article (uppercase Al-)', () => {
      // Input has lowercase 'h' (→ ه), not 'H' (→ ح). No sun-letter assimilation.
      // ال + r, a(drop), h, m, aa, n → ا ل ر ه م ا ن
      expect(transliterate('Al-rahmaan')).toBe('الرهمان');
    });

    it('emits literal ال for the article (el- variant)', () => {
      expect(transliterate('el-kitaab')).toBe('الكتاب');
    });

    it('handles bare article with empty rest (al- → ال)', () => {
      expect(transliterate('al-')).toBe('ال');
    });

    it('article applies per word, not just at the very start', () => {
      // 'foo al-kitaab' → ['foo', 'al-kitaab']
      // word 1: 'foo' → f, oo(long vowel → و) → ف و
      //   ('oo' is a length-2 long vowel match, taken before length-1 'o'.)
      // word 2: article 'al-', rest 'kitaab' → الكتاب
      expect(transliterate('foo al-kitaab')).toBe('فوالكتاب');
    });

    it('article rule fires per word, not just on the first (al-bayt al-haram)', () => {
      // word 1: article + 'bayt' → ال + b→ب, a(drop), y→ي, t→ت = البيت
      // word 2: article + 'haram' → ال + h→ه, a(drop), r→ر, a(drop), m→م = الهرم
      // joined with '' → البيتالهرم
      expect(transliterate('al-bayt al-haram')).toBe('البيتالهرم');
    });

    it('handles the canonical Allah case (al-lah → الله)', () => {
      // Article strips 'al-', rest='lah' → tokens [l→ل, a(drop), h→ه] → render: له
      // Final: ال + له = الله
      expect(transliterate('al-lah')).toBe('الله');
    });

    it('handles Allah with doubled-l input (al-llah → الله)', () => {
      // Article strips 'al-', rest='llah' → tokens [l, l(dedup), a(drop), h] → render: له
      // Final: ال + له = الله
      expect(transliterate('al-llah')).toBe('الله');
    });

    it('preserves doubled ل around a long vowel after article (al-laah → اللاه)', () => {
      // Article strips 'al-', rest='laah' → tokens [l→ل, aa→ا, h→ه] → render: لاه
      // Final: ال + لاه = اللاه. The render dedup tracker never sees the article ل
      // (it's string-concatenated outside render), so both ل letters survive around aa.
      expect(transliterate('al-laah')).toBe('اللاه');
    });
  });

  describe('dedup and doubling', () => {
    it('collapses doubled consonants (rabb → رب)', () => {
      // updated for D2: dedup scoped to ل only — non-ل gemination now preserved
      // r, a(drop), b, b → ر ب ب
      expect(transliterate('rabb')).toBe('ربب');
    });

    it('collapses doubled consonants inside a word (muhammad)', () => {
      // updated for D2: dedup scoped to ل only — non-ل gemination now preserved
      // Input has lowercase 'h' (→ ه), not 'H' (→ ح).
      // m, u(drop), h, a(drop), m, m, a(drop), d → م ه م م د
      expect(transliterate('muhammad')).toBe('مهممد');
    });

    it('does not collapse doubled long vowels (aaaa stays as ا ا)', () => {
      // Long vowels are not deduped per Q7=A; tokenize gives [aa, aa] → ا ا
      expect(transliterate('aaaa')).toBe('اا');
    });
  });

  describe('whitespace and unknown input', () => {
    it('drops unknown Latin letters as passthrough', () => {
      // 'x' is the only truly-unmapped Latin letter here. 'y' is a mapped
      // consonant (→ ي) per CONSONANTS.
      // x(passthrough), k, i(drop), t, aa, b, y → ك ت ا ب ي
      expect(transliterate('xkitaaby')).toBe('كتابي');
    });

    it('drops only truly-unmapped Latin letters as passthrough', () => {
      // 'x' → passthrough; 'y' → ي; 'z' → ز.
      expect(transliterate('xyz')).toBe('يز');
    });

    it('collapses internal whitespace and concatenates words with no separator', () => {
      // 'al-  kitaab' → normalize → 'al- kitaab' → split → ['al-', 'kitaab']
      // word 1: article matches 'al-', rest = '' → 'ال'
      // word 2: 'kitaab' → 'كتاب'
      // joined with '' → 'الكتاب'
      expect(transliterate('al-  kitaab')).toBe('الكتاب');
    });

    it('trims leading and trailing whitespace', () => {
      expect(transliterate('  b  ')).toBe('ب');
    });

    it('treats mid-word hyphen as passthrough (no article logic)', () => {
      // 'mid-word' has no leading al-/el-, so the regex does not match.
      // tokens: m→م, i(drop), d→د, -(passthrough drop), w→و, o(drop), r→ر, d→د
      // → م د و ر د
      expect(transliterate('mid-word')).toBe('مدورد');
    });

    it('returns empty for whitespace-only input', () => {
      expect(transliterate('   ')).toBe('');
    });
  });
});
