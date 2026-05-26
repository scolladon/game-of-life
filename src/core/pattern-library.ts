import { cloneGrid, type Grid } from './grid';
import { parseRle } from './rle';

// Bibliothèque de patterns embarquée — chaque pattern est stocké en RLE
// (format standard du Game of Life) et parsé à la demande.
// Avantages : lisible côté code, testable indépendamment du parser, immutable
// (chaque appel à getPatternLibrary() retourne des copies indépendantes).

export const PATTERN_CATEGORIES = [
  'still-life',
  'oscillator',
  'spaceship',
  'gun',
] as const;

export type PatternCategory = (typeof PATTERN_CATEGORIES)[number];

export interface PatternLibraryEntry {
  readonly name: string;
  readonly displayName: string;
  readonly category: PatternCategory;
  readonly grid: Grid;
}

interface RawPattern {
  readonly name: string;
  readonly displayName: string;
  readonly category: PatternCategory;
  readonly rle: string;
}

// Sources : conwaylife.com/wiki — formes canoniques minimales.
const RAW_PATTERNS: readonly RawPattern[] = [
  {
    name: 'block',
    displayName: 'Block',
    category: 'still-life',
    rle: 'x = 2, y = 2\n2o$2o!',
  },
  {
    name: 'beehive',
    displayName: 'Beehive',
    category: 'still-life',
    rle: 'x = 4, y = 3\nb2ob$o2bo$b2o!',
  },
  {
    name: 'blinker',
    displayName: 'Blinker',
    category: 'oscillator',
    rle: 'x = 3, y = 1\n3o!',
  },
  {
    name: 'toad',
    displayName: 'Toad',
    category: 'oscillator',
    rle: 'x = 4, y = 2\nb3o$3o!',
  },
  {
    name: 'beacon',
    displayName: 'Beacon',
    category: 'oscillator',
    rle: 'x = 4, y = 4\n2o2b$2o2b$2b2o$2b2o!',
  },
  {
    name: 'pulsar',
    displayName: 'Pulsar',
    category: 'oscillator',
    rle:
      'x = 13, y = 13\n' +
      '2b3o3b3o2b$13b$o4bobo4bo$o4bobo4bo$o4bobo4bo$2b3o3b3o2b$13b$' +
      '2b3o3b3o2b$o4bobo4bo$o4bobo4bo$o4bobo4bo$13b$2b3o3b3o2b!',
  },
  {
    name: 'r-pentomino',
    displayName: 'R-pentomino',
    category: 'oscillator',
    rle: 'x = 3, y = 3\nb2o$2ob$bo!',
  },
  {
    name: 'glider',
    displayName: 'Glider',
    category: 'spaceship',
    rle: 'x = 3, y = 3\nbob$2bo$3o!',
  },
  {
    name: 'lwss',
    displayName: 'LWSS (Lightweight Spaceship)',
    category: 'spaceship',
    rle: 'x = 5, y = 4\nbo2bo$o4b$o3bo$4o!',
  },
  {
    name: 'gosper-glider-gun',
    displayName: 'Gosper Glider Gun',
    category: 'gun',
    rle:
      'x = 36, y = 9\n' +
      '24bo11b$22bobo11b$12b2o6b2o12b2o$11bo3bo4b2o12b2o$2o8bo5bo3b2o14b$' +
      '2o8bo3bob2o4bobo11b$10bo5bo7bo11b$11bo3bo20b$12b2o!',
  },
];

let cached: readonly PatternLibraryEntry[] | null = null;

function buildLibrary(): readonly PatternLibraryEntry[] {
  return RAW_PATTERNS.map((raw) => ({
    name: raw.name,
    displayName: raw.displayName,
    category: raw.category,
    grid: parseRle(raw.rle),
  }));
}

function snapshotEntry(entry: PatternLibraryEntry): PatternLibraryEntry {
  return {
    name: entry.name,
    displayName: entry.displayName,
    category: entry.category,
    grid: cloneGrid(entry.grid),
  };
}

function getCached(): readonly PatternLibraryEntry[] {
  if (cached === null) {
    cached = buildLibrary();
  }
  return cached;
}

export function getPatternLibrary(): readonly PatternLibraryEntry[] {
  return getCached().map(snapshotEntry);
}

export function getPatternLibraryEntry(name: string): PatternLibraryEntry {
  const match = getCached().find((entry) => entry.name === name);
  if (!match) {
    throw new Error(`Unknown pattern: ${name}`);
  }
  return snapshotEntry(match);
}
