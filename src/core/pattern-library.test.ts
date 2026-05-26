import { describe, expect, it } from 'vitest';
import {
  getPatternLibrary,
  getPatternLibraryEntry,
  PATTERN_CATEGORIES,
  type PatternCategory,
  type PatternLibraryEntry,
} from './pattern-library';

const VALID_CATEGORIES: readonly PatternCategory[] = PATTERN_CATEGORIES;
const REQUIRED_PATTERNS = [
  'glider',
  'blinker',
  'toad',
  'beacon',
  'pulsar',
  'gosper-glider-gun',
  'lwss',
  'r-pentomino',
] as const;

describe('getPatternLibrary — catalogue enrichi', () => {
  it('given the library when listed then contains at least eight patterns', () => {
    const sut = getPatternLibrary();

    expect(sut.length).toBeGreaterThanOrEqual(8);
  });

  it('given the library when listed then includes the canonical patterns', () => {
    const sut = getPatternLibrary().map((entry) => entry.name);

    for (const name of REQUIRED_PATTERNS) {
      expect(sut).toContain(name);
    }
  });

  it('given the library when listed then each entry has a unique name', () => {
    const sut = getPatternLibrary();
    const names = new Set(sut.map((entry) => entry.name));

    expect(names.size).toBe(sut.length);
  });

  it('given each entry when inspected then it exposes a non-empty displayName', () => {
    const sut = getPatternLibrary();

    for (const entry of sut) {
      expect(entry.displayName.length).toBeGreaterThan(0);
    }
  });

  it('given each entry when inspected then its category is one of the supported values', () => {
    const sut = getPatternLibrary();

    for (const entry of sut) {
      expect(VALID_CATEGORIES).toContain(entry.category);
    }
  });

  it('given each entry when inspected then its grid is rectangular and non-empty', () => {
    const sut = getPatternLibrary();

    for (const entry of sut) {
      expect(entry.grid.length).toBeGreaterThan(0);
      const width = entry.grid[0].length;
      expect(width).toBeGreaterThan(0);
      for (const row of entry.grid) {
        expect(row.length).toBe(width);
      }
    }
  });

  it('given two calls to getPatternLibrary when compared then returns fresh grids (no shared mutation)', () => {
    const first = getPatternLibrary();

    const sut = getPatternLibrary();

    expect(sut).not.toBe(first);
    for (let i = 0; i < first.length; i++) {
      expect(sut[i].grid).not.toBe(first[i].grid);
    }
  });

  it('given the library when grouped by category then covers oscillator, spaceship, still-life and gun', () => {
    const categories = new Set<PatternCategory>(getPatternLibrary().map((entry) => entry.category));

    expect(categories.has('oscillator')).toBe(true);
    expect(categories.has('spaceship')).toBe(true);
    expect(categories.has('still-life')).toBe(true);
    expect(categories.has('gun')).toBe(true);
  });
});

describe('getPatternLibraryEntry — accès par nom', () => {
  it('given a known name when looked up then returns the matching entry', () => {
    const sut: PatternLibraryEntry = getPatternLibraryEntry('glider');

    expect(sut.name).toBe('glider');
    expect(sut.category).toBe('spaceship');
    expect(sut.grid.length).toBeGreaterThan(0);
  });

  it('given an unknown name when looked up then throws', () => {
    expect(() => getPatternLibraryEntry('not-a-pattern')).toThrow(/unknown pattern/i);
  });

  it('given two lookups when compared then returns distinct grid instances', () => {
    const first = getPatternLibraryEntry('blinker');

    const sut = getPatternLibraryEntry('blinker');

    expect(sut.grid).not.toBe(first.grid);
  });
});

describe('PATTERN_CATEGORIES — ordre stable', () => {
  it('given the categories when listed then matches the documented order', () => {
    const sut = PATTERN_CATEGORIES;

    expect(sut).toEqual(['still-life', 'oscillator', 'spaceship', 'gun']);
  });
});
