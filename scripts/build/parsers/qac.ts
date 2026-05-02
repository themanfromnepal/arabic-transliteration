export {};

export type QacToken = {
  sura: number;
  ayah: number;
  wordIndex: number;
  segmentIndex: number;
  form: string;
  tag: string;
  features: Record<string, string>;
};

const LOCATION_RE = /^\((\d+):(\d+):(\d+):(\d+)\)$/;

export const parseQac = (input: string): QacToken[] => {
  const tokens: QacToken[] = [];
  const lines = input.split(/\r?\n/);
  let seenData = false;
  for (const raw of lines) {
    const line = raw.trimEnd();
    if (line.length === 0) continue;
    if (line.trimStart().startsWith('#')) continue;
    const cols = line.split('\t');
    const location = cols[0]!;
    const m = LOCATION_RE.exec(location);
    if (!m) {
      if (!seenData) continue;
      throw new Error(`qac: malformed LOCATION (expected (s:a:w:seg)): ${location}`);
    }
    if (cols.length < 4) {
      throw new Error(`qac: expected 4 tab-separated columns, got ${cols.length}: ${raw}`);
    }
    seenData = true;
    const form = cols[1]!;
    const tag = cols[2]!;
    const featuresStr = cols[3]!;
    const features: Record<string, string> = {};
    if (featuresStr.length > 0) {
      for (const tok of featuresStr.split('|')) {
        if (tok.length === 0) continue;
        const idx = tok.indexOf(':');
        if (idx === -1) {
          features[tok] = '';
        } else {
          features[tok.slice(0, idx)] = tok.slice(idx + 1);
        }
      }
    }
    tokens.push({
      sura: Number.parseInt(m[1]!, 10),
      ayah: Number.parseInt(m[2]!, 10),
      wordIndex: Number.parseInt(m[3]!, 10),
      segmentIndex: Number.parseInt(m[4]!, 10),
      form,
      tag,
      features,
    });
  }
  return tokens;
};
