export type Row = readonly boolean[];
export type Grid = readonly Row[];

export function createGrid(width: number, height: number): Grid {
  if (!Number.isInteger(width) || !Number.isInteger(height) || width < 0 || height < 0) {
    throw new RangeError(`createGrid: dimensions must be non-negative integers (got ${width}×${height})`);
  }
  return Array.from({ length: height }, () =>
    Array.from({ length: width }, () => false),
  );
}

export function getCell(grid: Grid, x: number, y: number): boolean {
  if (y < 0 || y >= grid.length) return false;
  const row = grid[y];
  if (x < 0 || x >= row.length) return false;
  return row[x];
}

export function cloneGrid(grid: Grid): Grid {
  return grid.map((row) => row.slice());
}
