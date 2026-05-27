import { describe, expect, it } from 'vitest';
import { cloneGrid, createGrid, type Grid, getCell } from './grid';

describe('createGrid', () => {
  it('produit les bonnes dimensions', () => {
    const sut = createGrid(5, 3);
    expect(sut.length).toBe(3);
    for (const row of sut) {
      expect(row.length).toBe(5);
    }
  });

  it('initialise toutes les cellules à false', () => {
    const sut = createGrid(4, 4);
    for (const row of sut) {
      for (const cell of row) {
        expect(cell).toBe(false);
      }
    }
  });

  it('rejette les dimensions négatives ou non entières', () => {
    expect(() => createGrid(-1, 3)).toThrow(RangeError);
    expect(() => createGrid(3, -1)).toThrow(RangeError);
    expect(() => createGrid(1.5, 3)).toThrow(RangeError);
  });
});

describe('getCell', () => {
  const grid: Grid = [
    [true, false, true],
    [false, true, false],
  ];

  it('renvoie la valeur dans les bornes', () => {
    expect(getCell(grid, 0, 0)).toBe(true);
    expect(getCell(grid, 1, 0)).toBe(false);
    expect(getCell(grid, 1, 1)).toBe(true);
  });

  it('renvoie false hors-bornes (bord-mort)', () => {
    expect(getCell(grid, -1, 0)).toBe(false);
    expect(getCell(grid, 0, -1)).toBe(false);
    expect(getCell(grid, 3, 0)).toBe(false);
    expect(getCell(grid, 0, 2)).toBe(false);
  });
});

describe('cloneGrid', () => {
  it('produit une copie indépendante', () => {
    const original = createGrid(3, 3) as boolean[][];
    original[1][1] = true;

    const sut = cloneGrid(original);
    (original as boolean[][])[0][0] = true;

    expect(sut[1][1]).toBe(true);
    expect(sut[0][0]).toBe(false);
  });
});
