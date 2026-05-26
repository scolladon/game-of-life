import { describe, expect, it } from 'vitest';
import type { Grid } from './grid';
import {
  createSimulator,
  reset,
  type SimulatorState,
  setRunning,
  setSpeed,
  tick,
} from './simulator';

const O = true;
const _ = false;

const BLINKER_H: Grid = [
  [_, _, _, _, _],
  [_, _, _, _, _],
  [_, O, O, O, _],
  [_, _, _, _, _],
  [_, _, _, _, _],
];

describe('createSimulator', () => {
  it('given a seed and a speed when created then exposes a runnable initial state', () => {
    const sut: SimulatorState = createSimulator(BLINKER_H, 200);

    expect(sut.grid).toEqual(BLINKER_H);
    expect(sut.generation).toBe(0);
    expect(sut.speedMs).toBe(200);
    expect(sut.isRunning).toBe(false);
  });

  it('given an initial grid when created then does not share the same reference (immutability)', () => {
    const sut = createSimulator(BLINKER_H, 200);

    expect(sut.grid).not.toBe(BLINKER_H);
  });

  it('given a non-positive speed when created then throws', () => {
    expect(() => createSimulator(BLINKER_H, 0)).toThrow(RangeError);
    expect(() => createSimulator(BLINKER_H, -50)).toThrow(RangeError);
  });
});

describe('tick', () => {
  it('given a blinker when ticked once then oscillates vertical and bumps generation', () => {
    const initial = createSimulator(BLINKER_H, 200);

    const sut = tick(initial);

    expect(sut.generation).toBe(1);
    expect(sut.grid[2]?.[2]).toBe(true);
    expect(sut.grid[1]?.[2]).toBe(true);
    expect(sut.grid[3]?.[2]).toBe(true);
    expect(sut.grid[2]?.[1]).toBe(false);
    expect(sut.grid[2]?.[3]).toBe(false);
  });

  it('given a state when ticked then returns a new object (immutability)', () => {
    const initial = createSimulator(BLINKER_H, 200);

    const sut = tick(initial);

    expect(sut).not.toBe(initial);
    expect(initial.generation).toBe(0);
  });

  it('given a running state when ticked then preserves isRunning and speedMs', () => {
    const initial = setRunning(createSimulator(BLINKER_H, 150), true);

    const sut = tick(initial);

    expect(sut.isRunning).toBe(true);
    expect(sut.speedMs).toBe(150);
  });
});

describe('setSpeed', () => {
  it('given a state when speed is changed then returns a new state with the new speed', () => {
    const initial = createSimulator(BLINKER_H, 200);

    const sut = setSpeed(initial, 500);

    expect(sut.speedMs).toBe(500);
    expect(sut).not.toBe(initial);
    expect(initial.speedMs).toBe(200);
  });

  it('given a non-positive speed when setting then throws', () => {
    const initial = createSimulator(BLINKER_H, 200);

    expect(() => setSpeed(initial, 0)).toThrow(RangeError);
    expect(() => setSpeed(initial, -10)).toThrow(RangeError);
  });
});

describe('setRunning', () => {
  it('given a paused state when set running then flips isRunning to true', () => {
    const initial = createSimulator(BLINKER_H, 200);

    const sut = setRunning(initial, true);

    expect(sut.isRunning).toBe(true);
    expect(sut).not.toBe(initial);
  });

  it('given a running state when set paused then flips isRunning to false', () => {
    const initial = setRunning(createSimulator(BLINKER_H, 200), true);

    const sut = setRunning(initial, false);

    expect(sut.isRunning).toBe(false);
  });
});

describe('reset', () => {
  it('given a ticked running state when reset then generation is 0 and isRunning is false', () => {
    const initial = createSimulator(BLINKER_H, 200);
    const ticked = setRunning(tick(tick(initial)), true);

    const sut = reset(ticked, BLINKER_H);

    expect(sut.generation).toBe(0);
    expect(sut.isRunning).toBe(false);
    expect(sut.grid).toEqual(BLINKER_H);
  });

  it('given a state when reset then preserves the current speed', () => {
    const initial = setSpeed(createSimulator(BLINKER_H, 200), 700);

    const sut = reset(initial, BLINKER_H);

    expect(sut.speedMs).toBe(700);
  });

  it('given a state when reset then does not share the new grid reference', () => {
    const initial = createSimulator(BLINKER_H, 200);

    const sut = reset(initial, BLINKER_H);

    expect(sut.grid).not.toBe(BLINKER_H);
  });
});
