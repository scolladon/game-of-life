import { beforeEach, describe, expect, it } from 'vitest';
import type { Grid } from '@/core/grid';
import { createDb, type DrizzleDatabase } from './db';
import { countPatterns, createPattern, getPattern, listPatterns } from './patterns-repository';

const O = true;
const _ = false;
const BLINKER: Grid = [
  [_, _, _],
  [O, O, O],
  [_, _, _],
];

const TOKEN_A = 'token-a';
const TOKEN_B = 'token-b';

describe('patterns repository — createPattern / listPatterns / getPattern', () => {
  let db: DrizzleDatabase;

  beforeEach(() => {
    db = createDb(':memory:');
  });

  it('given an empty database when listPatterns then returns an empty array', async () => {
    const sut = await listPatterns(50, db);

    expect(sut).toEqual([]);
  });

  it('given a created pattern when getPattern then round-trips the grid and metadata', async () => {
    const created = await createPattern(
      {
        name: 'my blinker',
        grid: BLINKER,
        ruleName: 'conway',
        authorToken: TOKEN_A,
        authorDisplayName: 'Alice',
      },
      db,
    );

    const sut = await getPattern(created.id, db);

    expect(sut).not.toBeNull();
    expect(sut?.name).toBe('my blinker');
    expect(sut?.grid).toEqual(BLINKER);
    expect(sut?.ruleName).toBe('conway');
    expect(sut?.authorToken).toBe(TOKEN_A);
    expect(sut?.createdAt).toBeInstanceOf(Date);
  });

  it('given two creates when listPatterns then returns the most recent first', async () => {
    await createPattern(
      {
        name: 'first',
        grid: BLINKER,
        ruleName: 'conway',
        authorToken: TOKEN_A,
        authorDisplayName: 'Alice',
      },
      db,
    );
    await createPattern(
      {
        name: 'second',
        grid: BLINKER,
        ruleName: 'highlife',
        authorToken: TOKEN_B,
        authorDisplayName: 'Bob',
      },
      db,
    );

    const sut = await listPatterns(50, db);

    expect(sut).toHaveLength(2);
    expect(sut[0]?.name).toBe('second');
    expect(sut[1]?.name).toBe('first');
  });

  it('given the same authorToken reused when createPattern then keeps the initial author', async () => {
    await createPattern(
      {
        name: 'first',
        grid: BLINKER,
        ruleName: 'conway',
        authorToken: TOKEN_A,
        authorDisplayName: 'Alice',
      },
      db,
    );
    const sut = await createPattern(
      {
        name: 'second',
        grid: BLINKER,
        ruleName: 'conway',
        authorToken: TOKEN_A,
        authorDisplayName: 'Alice-renamed',
      },
      db,
    );

    expect(sut.authorToken).toBe(TOKEN_A);
    const count = await countPatterns(db);
    expect(count).toBe(2);
  });

  it('given an empty name when createPattern then throws', async () => {
    await expect(
      createPattern(
        {
          name: '   ',
          grid: BLINKER,
          ruleName: 'conway',
          authorToken: TOKEN_A,
          authorDisplayName: 'Alice',
        },
        db,
      ),
    ).rejects.toThrow(/name/);
  });

  it('given an unknown id when getPattern then returns null', async () => {
    const sut = await getPattern(999, db);

    expect(sut).toBeNull();
  });
});
