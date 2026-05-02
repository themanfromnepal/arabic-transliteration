import Papa from 'papaparse';

export const TRAILER_MARKER = '# orphaned';

export type ParsedCuration = {
  header: string[];
  rows: string[][];
  trailer: string[][];
};

const stripBom = (text: string): string =>
  text.length > 0 && text.charCodeAt(0) === 0xfeff ? text.slice(1) : text;

const isTrailerMarker = (row: string[]): boolean => {
  if (row.length === 0) return false;
  if (row[0] !== TRAILER_MARKER) return false;
  for (let i = 1; i < row.length; i++) {
    const cell = row[i];
    if (cell !== undefined && cell !== '') return false;
  }
  return true;
};

const STRUCTURAL_ERROR_TYPES: ReadonlySet<string> = new Set([
  'Quotes',
  'Delimiter',
  'FieldMismatch',
]);

export const parseCsvWithTrailer = (text: string): ParsedCuration => {
  const stripped = stripBom(text);
  const result = Papa.parse<string[]>(stripped, {
    header: false,
    skipEmptyLines: true,
    delimiter: ',',
  });
  for (const err of result.errors) {
    if (STRUCTURAL_ERROR_TYPES.has(err.type)) {
      throw new Error(
        `csv parse error (row ${err.row}, type=${err.type}, code=${err.code}): ${err.message}`,
      );
    }
  }
  const data = result.data;
  if (data.length === 0) {
    return { header: [], rows: [], trailer: [] };
  }
  const header = data[0] ?? [];
  let markerIdx = -1;
  for (let i = 1; i < data.length; i++) {
    const row = data[i];
    if (row && isTrailerMarker(row)) {
      markerIdx = i;
      break;
    }
  }
  if (markerIdx === -1) {
    return { header, rows: data.slice(1), trailer: [] };
  }
  return {
    header,
    rows: data.slice(1, markerIdx),
    trailer: data.slice(markerIdx + 1),
  };
};

export const serializeCsvWithTrailer = (
  header: string[],
  rows: string[][],
  trailer: string[][],
): string => {
  for (const row of rows) {
    if (row.length > 0 && row[0] === TRAILER_MARKER) {
      throw new Error(
        'serializeCsvWithTrailer: primary row first cell must not equal TRAILER_MARKER',
      );
    }
  }
  const primary = Papa.unparse({ fields: header, data: rows }, { newline: '\r\n', quotes: true });
  let body = primary;
  if (trailer.length > 0) {
    const trailerCsv = Papa.unparse(trailer, {
      newline: '\r\n',
      quotes: true,
      header: false,
    });
    body = `${primary}\r\n"${TRAILER_MARKER}"\r\n${trailerCsv}`;
  }
  return `\uFEFF${body}`;
};
