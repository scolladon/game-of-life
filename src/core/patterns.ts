import { cloneGrid, type Grid } from './grid';

export type PatternName = 'blinker' | 'block' | 'toad' | 'glider';

export const PATTERN_NAMES: readonly PatternName[] = [
  'blinker',
  'block',
  'toad',
  'glider',
] as const;

const O = true;
const _ = false;

const BLINKER: Grid = [
  [_, _, _, _, _],
  [_, _, _, _, _],
  [_, O, O, O, _],
  [_, _, _, _, _],
  [_, _, _, _, _],
];

const BLOCK: Grid = [
  [_, _, _, _],
  [_, O, O, _],
  [_, O, O, _],
  [_, _, _, _],
];

const TOAD: Grid = [
  [_, _, _, _, _, _],
  [_, _, _, _, _, _],
  [_, _, O, O, O, _],
  [_, O, O, O, _, _],
  [_, _, _, _, _, _],
  [_, _, _, _, _, _],
];

const GLIDER: Grid = [
  [_, _, _, _, _, _],
  [_, _, O, _, _, _],
  [_, _, _, O, _, _],
  [_, O, O, O, _, _],
  [_, _, _, _, _, _],
  [_, _, _, _, _, _],
];

const CATALOG: Readonly<Record<PatternName, Grid>> = {
  blinker: BLINKER,
  block: BLOCK,
  toad: TOAD,
  glider: GLIDER,
};

export function getPattern(name: PatternName): Grid {
  const seed = CATALOG[name];
  if (!seed) {
    throw new Error(`Unknown pattern: ${String(name)}`);
  }
  return cloneGrid(seed);
}
