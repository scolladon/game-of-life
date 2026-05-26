import { afterEach, describe, expect, it } from 'vitest';
import type { Grid } from '@/core/grid';
import { CONWAY, HIGHLIFE } from '@/core/rules';
import { computeNextGrid, isWorkerSupported, resetWorker } from './step-client';

const O = true;
const _ = false;

const BLINKER_HORIZONTAL: Grid = [
  [_, _, _, _, _],
  [_, _, _, _, _],
  [_, O, O, O, _],
  [_, _, _, _, _],
  [_, _, _, _, _],
];

const BLINKER_VERTICAL: Grid = [
  [_, _, _, _, _],
  [_, _, O, _, _],
  [_, _, O, _, _],
  [_, _, O, _, _],
  [_, _, _, _, _],
];

describe('step-client wrapper (mode fallback Node)', () => {
  afterEach(() => {
    resetWorker();
  });

  it('given Node when isWorkerSupported then returns false', () => {
    const sut = isWorkerSupported();

    expect(sut).toBe(false);
  });

  it('given a horizontal blinker when computeNextGrid then renvoie la rotation vertical', async () => {
    const sut = await computeNextGrid(BLINKER_HORIZONTAL, CONWAY);

    expect(sut).toEqual(BLINKER_VERTICAL);
  });

  it('given HighLife when computeNextGrid then délègue à la bonne règle', async () => {
    // HighLife = B36/S23 : sur un blinker, comportement identique à Conway
    // (3 voisins font naître, 2 ou 3 font survivre).
    const sut = await computeNextGrid(BLINKER_HORIZONTAL, HIGHLIFE);

    expect(sut).toEqual(BLINKER_VERTICAL);
  });
});
