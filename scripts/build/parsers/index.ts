export {};

import { promises as fs } from 'node:fs';
import { existsSync } from 'node:fs';
import path from 'node:path';

import type { AyahTranslation, Verse, WbwEntry } from '../../../src/types/dictionary';
import { parseTanzil } from './tanzil';
import { parseQac, type QacToken } from './qac';
import { parseWbw } from './wbw';
import { parseYusufali } from './yusufali';

export type LoadedSources = {
  verses: Verse[];
  qacTokens: QacToken[];
  wbw: WbwEntry[];
  yusufali: AyahTranslation[];
};

const SOURCES_DIR = 'data/sources';

const FILES = {
  tanzil: 'quran-uthmani.txt',
  qac: 'quranic-corpus-morphology-0.4.txt',
  wbw: 'english-wbw-translation.json',
  yusufali: 'quran-en-yusufali-simple.json',
} as const;

const PENDING_LICENSE_FILES: Array<{ file: string; note: string }> = [
  {
    file: FILES.wbw,
    note: 'Tarteel/Qul WBW (resource 92) — confirmation pending; will be hard-gated in Stage F.',
  },
  {
    file: FILES.yusufali,
    note: 'Tarteel/Qul Yusuf Ali (resource 124) — confirmation pending; will be hard-gated in Stage F.',
  },
];

const sourcePath = (file: string): string => path.resolve(process.cwd(), SOURCES_DIR, file);

const requireFile = async (file: string): Promise<string> => {
  const p = sourcePath(file);
  if (!existsSync(p)) {
    throw new Error(
      `Missing ${SOURCES_DIR}/${file}. See ${SOURCES_DIR}/README.md for re-acquisition instructions.`,
    );
  }
  return fs.readFile(p, 'utf8');
};

export const sourcesAvailable = (): boolean =>
  Object.values(FILES).every((file) => existsSync(sourcePath(file)));

export const loadSources = async (): Promise<LoadedSources> => {
  for (const { file, note } of PENDING_LICENSE_FILES) {
    console.warn(`[license] ${SOURCES_DIR}/${file} — ${note}`);
  }

  const [tanzilText, qacText, wbwText, yusufaliText] = await Promise.all([
    requireFile(FILES.tanzil),
    requireFile(FILES.qac),
    requireFile(FILES.wbw),
    requireFile(FILES.yusufali),
  ]);

  return {
    verses: parseTanzil(tanzilText),
    qacTokens: parseQac(qacText),
    wbw: parseWbw(wbwText),
    yusufali: parseYusufali(yusufaliText),
  };
};
