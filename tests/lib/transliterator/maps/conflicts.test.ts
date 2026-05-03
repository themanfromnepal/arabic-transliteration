import { describe, it, expect } from 'vitest';
import { CONSONANTS } from '@/src/lib/transliterator/maps/consonants';
import { DIGRAPHS } from '@/src/lib/transliterator/maps/digraphs';
import { ARABIZI } from '@/src/lib/transliterator/maps/arabizi';
import { VOWELS } from '@/src/lib/transliterator/maps/vowels';

describe('map key conflicts', () => {
  it('no Latin key appears in more than one table', () => {
    const tables: Record<string, Readonly<Record<string, string>>> = {
      CONSONANTS,
      DIGRAPHS,
      ARABIZI,
      VOWELS,
    };

    const ownership = new Map<string, string[]>();
    for (const [tableName, table] of Object.entries(tables)) {
      for (const key of Object.keys(table)) {
        const existing = ownership.get(key) ?? [];
        existing.push(tableName);
        ownership.set(key, existing);
      }
    }

    const conflicts = [...ownership.entries()].filter(([, owners]) => owners.length > 1);
    expect(conflicts, `keys appearing in multiple tables: ${JSON.stringify(conflicts)}`).toEqual(
      [],
    );
  });
});
