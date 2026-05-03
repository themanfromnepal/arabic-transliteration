import { describe, it, expect } from 'vitest';
import * as schema from '../../scripts/build/schema';

describe('schema module', () => {
  it('schema module loads', () => {
    expect(schema.LemmaEntrySchema).toBeDefined();
    expect(true).toBe(true);
  });
});
