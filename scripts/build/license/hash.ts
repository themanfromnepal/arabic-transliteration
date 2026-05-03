import { createHash } from 'node:crypto';
import { createReadStream } from 'node:fs';

export const sha256File = (path: string): Promise<string> =>
  new Promise((resolve, reject) => {
    const hash = createHash('sha256');
    const stream = createReadStream(path);
    stream.on('error', reject);
    stream.on('data', (chunk) => hash.update(chunk));
    stream.on('end', () => resolve(hash.digest('hex')));
  });

export const hashesEqual = (a: string, b: string): boolean => a.toLowerCase() === b.toLowerCase();
