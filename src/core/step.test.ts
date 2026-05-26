import { describe, expect, it } from 'vitest';
import type { Grid } from './grid';
import { HIGHLIFE } from './rules';
import { step } from './step';

const O = true;
const _ = false;

describe('step — règles Conway B3/S23', () => {
  it('blinker oscille entre horizontal et vertical (période 2)', () => {
    const horizontal: Grid = [
      [_, _, _],
      [O, O, O],
      [_, _, _],
    ];
    const vertical: Grid = [
      [_, O, _],
      [_, O, _],
      [_, O, _],
    ];

    const sut = step(horizontal);

    expect(sut).toEqual(vertical);
    expect(step(sut)).toEqual(horizontal);
  });

  it('block (still life 2×2) reste identique', () => {
    const block: Grid = [
      [_, _, _, _],
      [_, O, O, _],
      [_, O, O, _],
      [_, _, _, _],
    ];

    const sut = step(block);

    expect(sut).toEqual(block);
  });

  it("glider se déplace d'une case en diagonale après 4 steps", () => {
    const initial: Grid = [
      [_, _, _, _, _, _],
      [_, _, O, _, _, _],
      [_, _, _, O, _, _],
      [_, O, O, O, _, _],
      [_, _, _, _, _, _],
      [_, _, _, _, _, _],
    ];
    const after4: Grid = [
      [_, _, _, _, _, _],
      [_, _, _, _, _, _],
      [_, _, _, O, _, _],
      [_, _, _, _, O, _],
      [_, _, O, O, O, _],
      [_, _, _, _, _, _],
    ];

    let sut = initial;
    for (let i = 0; i < 4; i++) sut = step(sut);

    expect(sut).toEqual(after4);
  });

  it('toad oscille entre forme T horizontale et verticale (période 2)', () => {
    const horizontal: Grid = [
      [_, _, _, _, _, _],
      [_, _, _, _, _, _],
      [_, _, O, O, O, _],
      [_, O, O, O, _, _],
      [_, _, _, _, _, _],
      [_, _, _, _, _, _],
    ];
    const vertical: Grid = [
      [_, _, _, _, _, _],
      [_, _, _, O, _, _],
      [_, O, _, _, O, _],
      [_, O, _, _, O, _],
      [_, _, O, _, _, _],
      [_, _, _, _, _, _],
    ];

    const sut = step(horizontal);

    expect(sut).toEqual(vertical);
    expect(step(sut)).toEqual(horizontal);
  });

  it("ne mute pas la grille d'entrée", () => {
    const blinker: Grid = [
      [_, _, _],
      [O, O, O],
      [_, _, _],
    ];
    const snapshot = blinker.map((r) => r.slice());

    step(blinker);

    expect(blinker).toEqual(snapshot);
  });
});

describe('step — variante HighLife B36/S23', () => {
  it('naissance avec 6 voisins vivants (spécifique HighLife)', () => {
    // Cellule morte centrale [1][1] entourée de 6 voisins vivants
    // (3 en haut + 2 sur les côtés + 1 en bas).
    // Conway (B3) → reste morte. HighLife (B36) → naît.
    const grid: Grid = [
      [O, O, O],
      [O, _, O],
      [_, O, _],
    ];

    const conwayResult = step(grid);
    const highLifeResult = step(grid, HIGHLIFE);

    // Le centre [1][1] passe morte → vivante en HighLife (6 voisins, B36).
    expect(highLifeResult[1][1]).toBe(true);
    // En Conway B3, 6 voisins ne déclenchent pas la naissance.
    expect(conwayResult[1][1]).toBe(false);
  });

  it('survie identique à Conway pour 2 ou 3 voisins (S23)', () => {
    const block: Grid = [
      [_, _, _, _],
      [_, O, O, _],
      [_, O, O, _],
      [_, _, _, _],
    ];

    const sut = step(block, HIGHLIFE);

    // Block (still life) doit rester identique sous HighLife (S23).
    expect(sut).toEqual(block);
  });

  it('signature backward-compat : step(grid) sans rule = Conway', () => {
    const blinker: Grid = [
      [_, _, _],
      [O, O, O],
      [_, _, _],
    ];
    const vertical: Grid = [
      [_, O, _],
      [_, O, _],
      [_, O, _],
    ];

    const sut = step(blinker);

    expect(sut).toEqual(vertical);
  });
});
