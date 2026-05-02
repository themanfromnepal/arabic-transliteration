import { describe, it, expect } from 'vitest';
import {
  TRAILER_MARKER,
  parseCsvWithTrailer,
  serializeCsvWithTrailer,
} from '../../../scripts/build/curation/csv';

describe('parseCsvWithTrailer / serializeCsvWithTrailer', () => {
  it('strips a single leading BOM', () => {
    const text = '\uFEFFa,b\r\n1,2\r\n';
    const parsed = parseCsvWithTrailer(text);
    expect(parsed.header).toEqual(['a', 'b']);
    expect(parsed.rows).toEqual([['1', '2']]);
    expect(parsed.trailer).toEqual([]);
  });

  it('round-trips header + rows with BOM and CRLF', () => {
    const header = ['a', 'b'];
    const rows = [
      ['1', '2'],
      ['3', '4'],
    ];
    const out = serializeCsvWithTrailer(header, rows, []);
    expect(out.startsWith('\uFEFF')).toBe(true);
    expect(out.includes('\r\n')).toBe(true);
    const parsed = parseCsvWithTrailer(out);
    expect(parsed.header).toEqual(header);
    expect(parsed.rows).toEqual(rows);
    expect(parsed.trailer).toEqual([]);
  });

  it('preserves embedded quotes, commas, and newlines', () => {
    const header = ['a', 'b'];
    const rows = [['x"y', 'a,b\nc']];
    const out = serializeCsvWithTrailer(header, rows, []);
    const parsed = parseCsvWithTrailer(out);
    expect(parsed.rows).toEqual(rows);
  });

  it('preserves Arabic strings', () => {
    const header = ['arabic', 'meaning'];
    const rows = [['اللَّهِ', 'Allah']];
    const out = serializeCsvWithTrailer(header, rows, []);
    const parsed = parseCsvWithTrailer(out);
    expect(parsed.rows).toEqual(rows);
  });

  it('splits trailer at marker and rejoins', () => {
    const header = ['a', 'b'];
    const rows = [['1', '2']];
    const trailer = [
      ['9', '8'],
      ['orphan', 'row'],
    ];
    const out = serializeCsvWithTrailer(header, rows, trailer);
    expect(out.includes(TRAILER_MARKER)).toBe(true);
    const parsed = parseCsvWithTrailer(out);
    expect(parsed.header).toEqual(header);
    expect(parsed.rows).toEqual(rows);
    expect(parsed.trailer).toEqual(trailer);
  });

  it('missing trailer marker yields empty trailer', () => {
    const text = '\uFEFFa,b\r\n1,2\r\n3,4\r\n';
    const parsed = parseCsvWithTrailer(text);
    expect(parsed.trailer).toEqual([]);
    expect(parsed.rows).toEqual([
      ['1', '2'],
      ['3', '4'],
    ]);
  });

  it('serialize is idempotent', () => {
    const header = ['a', 'b'];
    const rows = [['1', '2']];
    const trailer = [['x', 'y']];
    const out1 = serializeCsvWithTrailer(header, rows, trailer);
    const parsed = parseCsvWithTrailer(out1);
    const out2 = serializeCsvWithTrailer(parsed.header, parsed.rows, parsed.trailer);
    expect(out2).toBe(out1);
  });

  it('serializeCsvWithTrailer rejects primary rows whose first cell is TRAILER_MARKER', () => {
    const header = ['a', 'b'];
    const rows = [[TRAILER_MARKER, 'oops']];
    expect(() => serializeCsvWithTrailer(header, rows, [])).toThrow(
      /primary row first cell must not equal TRAILER_MARKER/,
    );
  });

  it('parseCsvWithTrailer throws on structural errors (Quotes)', () => {
    // Unterminated quoted field → papaparse classifies as Quotes.
    const text = '\uFEFFa,b\r\n"unterminated,2\r\n3,4\r\n';
    expect(() => parseCsvWithTrailer(text)).toThrow(/csv parse error/);
  });
});
