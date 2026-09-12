import { promises as fs } from 'node:fs';
import path from 'node:path';

const isPlainObject = (v: unknown): v is Record<string, unknown> =>
  typeof v === 'object' &&
  v !== null &&
  (Object.getPrototypeOf(v) === Object.prototype || Object.getPrototypeOf(v) === null);

// Compact (no whitespace): shards were previously pretty-printed, which made dictionary.json
// 5.48 MB on disk for 2.49 MB of parsed data (B6 in phase-4-ui-stages.md) for no runtime benefit —
// IndexedDB stores the parsed structured clone, not the whitespace, and gzip on the wire hides most
// of the difference but not all of it. Determinism (the drift check's actual concern) comes from
// the alphabetical key sort below, not from indentation.
const encode = (value: unknown, seen: WeakSet<object>): string => {
  if (value === null) return 'null';
  const t = typeof value;
  if (t === 'string') return JSON.stringify(value);
  if (t === 'number') {
    if (!Number.isFinite(value as number)) {
      throw new TypeError(`Cannot serialize non-finite number: ${String(value)}`);
    }
    return JSON.stringify(value);
  }
  if (t === 'boolean') return JSON.stringify(value);
  if (t === 'undefined') throw new TypeError('Cannot serialize undefined');
  if (t === 'function') throw new TypeError('Cannot serialize function');
  if (t === 'symbol') throw new TypeError('Cannot serialize symbol');
  if (t === 'bigint') throw new TypeError('Cannot serialize bigint');

  const obj = value as object;
  if (seen.has(obj)) throw new TypeError('Cannot serialize circular reference');
  seen.add(obj);

  if (Array.isArray(obj)) {
    if (obj.length === 0) {
      seen.delete(obj);
      return '[]';
    }
    const items = obj.map((item) => encode(item, seen));
    seen.delete(obj);
    return `[${items.join(',')}]`;
  }

  if (isPlainObject(obj)) {
    const keys = Object.keys(obj).sort();
    if (keys.length === 0) {
      seen.delete(obj);
      return '{}';
    }
    const entries = keys.map(
      (k) => `${JSON.stringify(k)}:${encode((obj as Record<string, unknown>)[k], seen)}`,
    );
    seen.delete(obj);
    return `{${entries.join(',')}}`;
  }

  throw new TypeError(`Cannot serialize value of type ${Object.prototype.toString.call(obj)}`);
};

export const canonicalStringify = (value: unknown): string => {
  return `${encode(value, new WeakSet())}\n`;
};

export const writeCanonicalJson = async (filePath: string, value: unknown): Promise<void> => {
  await fs.mkdir(path.dirname(filePath), { recursive: true });
  await fs.writeFile(filePath, canonicalStringify(value), 'utf8');
};
