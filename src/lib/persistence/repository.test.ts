import { beforeEach, describe, expect, it } from 'vitest';
import type { Grid } from '@/core/grid';
import { createDb, type DrizzleDatabase } from './db';
import { loadLatestState, saveState } from './repository';

const O = true;
const _ = false;
const BLINKER: Grid = [
  [_, _, _],
  [O, O, O],
  [_, _, _],
];

describe('persistence repository — saveState / loadLatestState', () => {
  let db: DrizzleDatabase;

  beforeEach(() => {
    db = createDb(':memory:');
  });

  it('given an empty database when loadLatestState then returns null', async () => {
    const sut = await loadLatestState(db);

    expect(sut).toBeNull();
  });

  it('given a snapshot when saveState then it is persisted with id and createdAt', async () => {
    const sut = await saveState(
      {
        patternName: 'blinker',
        generation: 3,
        ruleName: 'conway',
        grid: BLINKER,
      },
      db,
    );

    expect(sut.id).toBeGreaterThan(0);
    expect(sut.patternName).toBe('blinker');
    expect(sut.generation).toBe(3);
    expect(sut.ruleName).toBe('conway');
    expect(sut.grid).toEqual(BLINKER);
    expect(sut.createdAt).toBeInstanceOf(Date);
  });

  it('given a saved snapshot when loadLatestState then round-trips the grid identically', async () => {
    await saveState(
      {
        patternName: 'blinker',
        generation: 7,
        ruleName: 'highlife',
        grid: BLINKER,
      },
      db,
    );

    const sut = await loadLatestState(db);

    expect(sut).not.toBeNull();
    expect(sut?.patternName).toBe('blinker');
    expect(sut?.generation).toBe(7);
    expect(sut?.ruleName).toBe('highlife');
    expect(sut?.grid).toEqual(BLINKER);
  });

  it('given multiple saves when loadLatestState then returns the most recent one', async () => {
    await saveState(
      { patternName: 'blinker', generation: 1, ruleName: 'conway', grid: BLINKER },
      db,
    );
    await saveState(
      { patternName: 'glider', generation: 42, ruleName: 'highlife', grid: BLINKER },
      db,
    );

    const sut = await loadLatestState(db);

    expect(sut?.patternName).toBe('glider');
    expect(sut?.generation).toBe(42);
    expect(sut?.ruleName).toBe('highlife');
  });
});
