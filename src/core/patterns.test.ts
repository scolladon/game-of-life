import { describe, expect, it } from 'vitest';
import { getPattern, PATTERN_NAMES, type PatternName } from './patterns';

function countAlive(grid: ReadonlyArray<ReadonlyArray<boolean>>): number {
  let count = 0;
  for (const row of grid) {
    for (const cell of row) {
      if (cell) count += 1;
    }
  }
  return count;
}

describe('PATTERN_NAMES — catalogue des seeds', () => {
  it('liste les 4 patterns dans un ordre stable', () => {
    const sut = PATTERN_NAMES;

    expect(sut).toEqual(['blinker', 'block', 'toad', 'glider']);
  });
});

describe('getPattern — retourne le seed nommé', () => {
  it('blinker — 5×5 avec 3 cellules vivantes alignées horizontalement', () => {
    const sut = getPattern('blinker');

    expect(sut).toHaveLength(5);
    expect(sut[0]).toHaveLength(5);
    expect(countAlive(sut)).toBe(3);
  });

  it('block — 4×4 still life avec 4 cellules vivantes', () => {
    const sut = getPattern('block');

    expect(sut).toHaveLength(4);
    expect(sut[0]).toHaveLength(4);
    expect(countAlive(sut)).toBe(4);
  });

  it('toad — 6×6 oscillateur avec 6 cellules vivantes', () => {
    const sut = getPattern('toad');

    expect(sut).toHaveLength(6);
    expect(sut[0]).toHaveLength(6);
    expect(countAlive(sut)).toBe(6);
  });

  it('glider — 6×6 vaisseau avec 5 cellules vivantes', () => {
    const sut = getPattern('glider');

    expect(sut).toHaveLength(6);
    expect(sut[0]).toHaveLength(6);
    expect(countAlive(sut)).toBe(5);
  });

  it('retourne une nouvelle instance à chaque appel (pas de partage mutable)', () => {
    const first = getPattern('blinker');

    const sut = getPattern('blinker');

    expect(sut).toEqual(first);
    expect(sut).not.toBe(first);
  });

  it('lance pour un nom inconnu', () => {
    const unknown = 'spaceship' as PatternName;

    expect(() => getPattern(unknown)).toThrow(/unknown pattern/i);
  });
});
