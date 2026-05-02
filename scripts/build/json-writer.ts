import { promises as fs } from 'node:fs';
import path from 'node:path';

const isPlainObject = (v: unknown): v is Record<string, unknown> =>
  typeof v === 'object' &&
  v !== null &&
  (Object.getPrototypeOf(v) === Object.prototype || Object.getPrototypeOf(v) === null);

const encode = (value: unknown, indent: number, seen: WeakSet<object>): string => {
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

  const pad = ' '.repeat(indent + 2);
  const closePad = ' '.repeat(indent);

  if (Array.isArray(obj)) {
    if (obj.length === 0) {
      seen.delete(obj);
      return '[]';
    }
    const items = obj.map((item) => `${pad}${encode(item, indent + 2, seen)}`);
    seen.delete(obj);
    return `[\n${items.join(',\n')}\n${closePad}]`;
  }

  if (isPlainObject(obj)) {
    const keys = Object.keys(obj).sort();
    if (keys.length === 0) {
      seen.delete(obj);
      return '{}';
    }
    const entries = keys.map(
      (k) =>
        `${pad}${JSON.stringify(k)}: ${encode((obj as Record<string, unknown>)[k], indent + 2, seen)}`,
    );
    seen.delete(obj);
    return `{\n${entries.join(',\n')}\n${closePad}}`;
  }

  throw new TypeError(`Cannot serialize value of type ${Object.prototype.toString.call(obj)}`);
};

export const canonicalStringify = (value: unknown): string => {
  return `${encode(value, 0, new WeakSet())}\n`;
};

export const writeCanonicalJson = async (filePath: string, value: unknown): Promise<void> => {
  await fs.mkdir(path.dirname(filePath), { recursive: true });
  await fs.writeFile(filePath, canonicalStringify(value), 'utf8');
};
