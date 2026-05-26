import { describe, expect, it } from 'vitest';
import { parseRle } from './rle';

const O = true;
const _ = false;

describe('parseRle — header', () => {
  it('given a valid header when parsing then produces a grid of the declared dimensions', () => {
    const sut = parseRle('x = 3, y = 2\n!');

    expect(sut).toHaveLength(2);
    expect(sut[0]).toHaveLength(3);
  });

  it('given a header with rule clause when parsing then ignores the rule and reads dimensions', () => {
    const sut = parseRle('x = 4, y = 3, rule = B3/S23\n!');

    expect(sut).toHaveLength(3);
    expect(sut[0]).toHaveLength(4);
  });

  it('given a header with extra whitespace when parsing then still reads dimensions', () => {
    const sut = parseRle('x =  5 , y =  2 \n!');

    expect(sut).toHaveLength(2);
    expect(sut[0]).toHaveLength(5);
  });

  it('given an input without a header when parsing then throws', () => {
    expect(() => parseRle('3o!')).toThrow(/header/i);
  });

  it('given a header with non-positive dimensions when parsing then throws', () => {
    expect(() => parseRle('x = 0, y = 3\n!')).toThrow(/dimensions/i);
    expect(() => parseRle('x = 3, y = -1\n!')).toThrow(/dimensions/i);
  });
});

describe('parseRle — body', () => {
  it('given a single alive cell when parsing then marks that cell', () => {
    const sut = parseRle('x = 1, y = 1\no!');

    expect(sut).toEqual([[O]]);
  });

  it('given a run-length encoded row when parsing then expands it', () => {
    const sut = parseRle('x = 5, y = 1\n2bo2b!');

    expect(sut).toEqual([[_, _, O, _, _]]);
  });

  it('given multi-line body with $ separator when parsing then produces multiple rows', () => {
    const sut = parseRle('x = 3, y = 2\n3o$3b!');

    expect(sut).toEqual([
      [O, O, O],
      [_, _, _],
    ]);
  });

  it('given run-length on $ when parsing then inserts (n-1) empty rows between contents', () => {
    const sut = parseRle('x = 2, y = 4\n2o3$2o!');

    expect(sut).toEqual([
      [O, O],
      [_, _],
      [_, _],
      [O, O],
    ]);
  });

  it('given a row shorter than declared width when parsing then pads with dead cells', () => {
    const sut = parseRle('x = 5, y = 1\n2o!');

    expect(sut).toEqual([[O, O, _, _, _]]);
  });

  it('given a body without the terminal ! when parsing then still produces the grid', () => {
    const sut = parseRle('x = 3, y = 1\n3o');

    expect(sut).toEqual([[O, O, O]]);
  });

  it('given an unknown character in the body when parsing then throws', () => {
    expect(() => parseRle('x = 3, y = 1\nzzz!')).toThrow(/unknown.*character/i);
  });
});

describe('parseRle — comments and noise', () => {
  it('given lines starting with # when parsing then ignores them', () => {
    const sut = parseRle('#N Glider\n#C A glider.\nx = 3, y = 3\nbob$2bo$3o!');

    expect(sut).toHaveLength(3);
    expect(sut[0]).toEqual([_, O, _]);
    expect(sut[1]).toEqual([_, _, O]);
    expect(sut[2]).toEqual([O, O, O]);
  });

  it('given blank lines in input when parsing then ignores them', () => {
    const sut = parseRle('\n\nx = 2, y = 1\n\n2o!\n');

    expect(sut).toEqual([[O, O]]);
  });
});

describe('parseRle — glider canonique', () => {
  it('given the canonical glider RLE when parsing then matches the known shape', () => {
    const sut = parseRle('x = 3, y = 3\nbob$2bo$3o!');

    expect(sut).toEqual([
      [_, O, _],
      [_, _, O],
      [O, O, O],
    ]);
  });
});

describe('parseRle — immutabilité', () => {
  it('given the same input parsed twice when comparing then returns distinct grid instances', () => {
    const input = 'x = 2, y = 1\n2o!';
    const first = parseRle(input);

    const sut = parseRle(input);

    expect(sut).toEqual(first);
    expect(sut).not.toBe(first);
  });
});
