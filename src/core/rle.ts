import type { Grid } from './grid';

// Parser RLE (Run-Length Encoded) — format standard du Game of Life.
// Référence : https://www.conwaylife.com/wiki/Run_Length_Encoded
//
// Sous-ensemble supporté :
//   - lignes `#…` ignorées (commentaires)
//   - header `x = N, y = M[, rule = …]`
//   - body : `b` = mort, `o` = vivant, `$` = newline, `!` = fin
//   - run-length numérique préfixe : `3o` = 3 vivantes, `2$` = 2 newlines
//   - lignes courtes paddées avec des cellules mortes
//   - terminal `!` optionnel

interface Header {
  readonly width: number;
  readonly height: number;
}

const HEADER_RE = /^\s*x\s*=\s*(-?\d+)\s*,\s*y\s*=\s*(-?\d+)/i;

function matchHeader(line: string): Header | null {
  const match = line.match(HEADER_RE);
  if (!match) return null;
  const width = Number.parseInt(match[1], 10);
  const height = Number.parseInt(match[2], 10);
  if (width <= 0 || height <= 0) {
    throw new Error(`parseRle: dimensions non positives (x=${width}, y=${height})`);
  }
  return { width, height };
}

function stripCommentsAndBlanks(input: string): readonly string[] {
  return input
    .split('\n')
    .map((line) => line.trim())
    .filter((line) => line.length > 0 && !line.startsWith('#'));
}

function makeEmptyRow(width: number): boolean[] {
  return Array.from({ length: width }, () => false);
}

function padRow(row: readonly boolean[], width: number): boolean[] {
  if (row.length >= width) return row.slice(0, width);
  return [...row, ...Array.from({ length: width - row.length }, () => false)];
}

interface ParserState {
  readonly rows: readonly (readonly boolean[])[];
  readonly current: readonly boolean[];
}

function pushCurrent(state: ParserState, width: number): ParserState {
  return {
    rows: [...state.rows, padRow(state.current, width)],
    current: [],
  };
}

function appendCells(state: ParserState, count: number, value: boolean): ParserState {
  const next = [...state.current];
  for (let i = 0; i < count; i++) next.push(value);
  return { rows: state.rows, current: next };
}

function endOfLine(state: ParserState, count: number, width: number): ParserState {
  let next = pushCurrent(state, width);
  for (let i = 1; i < count; i++) {
    next = { rows: [...next.rows, makeEmptyRow(width)], current: [] };
  }
  return next;
}

function parseBody(body: string, header: Header): Grid {
  let state: ParserState = { rows: [], current: [] };
  let runLength = 0;

  for (const char of body) {
    if (char >= '0' && char <= '9') {
      runLength = runLength * 10 + (char.charCodeAt(0) - 48);
      continue;
    }
    const count = runLength === 0 ? 1 : runLength;
    runLength = 0;

    if (char === 'b') {
      state = appendCells(state, count, false);
    } else if (char === 'o') {
      state = appendCells(state, count, true);
    } else if (char === '$') {
      state = endOfLine(state, count, header.width);
    } else if (char === '!') {
      break;
    } else {
      throw new Error(`parseRle: unknown character "${char}" in body`);
    }
  }

  if (state.current.length > 0) {
    state = pushCurrent(state, header.width);
  }

  while (state.rows.length < header.height) {
    state = { rows: [...state.rows, makeEmptyRow(header.width)], current: [] };
  }

  return state.rows.slice(0, header.height);
}

export function parseRle(input: string): Grid {
  const lines = stripCommentsAndBlanks(input);
  let header: Header | null = null;
  const bodyParts: string[] = [];
  for (const line of lines) {
    if (header === null) {
      const candidate = matchHeader(line);
      if (candidate !== null) {
        header = candidate;
        continue;
      }
    }
    bodyParts.push(line);
  }
  if (header === null) {
    throw new Error('parseRle: header introuvable (attendu "x = N, y = M").');
  }
  const body = bodyParts.join('').replace(/\s+/g, '');
  return parseBody(body, header);
}
