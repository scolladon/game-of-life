import { type Grid, getCell } from './grid';
import { CONWAY, type Rule } from './rules';

const NEIGHBOUR_OFFSETS: readonly (readonly [number, number])[] = [
  [-1, -1],
  [0, -1],
  [1, -1],
  [-1, 0],
  [1, 0],
  [-1, 1],
  [0, 1],
  [1, 1],
];

function countLiveNeighbours(grid: Grid, x: number, y: number): number {
  let count = 0;
  for (const [dx, dy] of NEIGHBOUR_OFFSETS) {
    if (getCell(grid, x + dx, y + dy)) count += 1;
  }
  return count;
}

function nextCell(alive: boolean, neighbours: number, rule: Rule): boolean {
  if (alive) return rule.survive.includes(neighbours);
  return rule.birth.includes(neighbours);
}

export function step(grid: Grid, rule: Rule = CONWAY): Grid {
  return grid.map((row, y) =>
    row.map((alive, x) => nextCell(alive, countLiveNeighbours(grid, x, y), rule)),
  );
}
