import { cloneGrid, type Grid } from './grid';
import { step } from './step';

export interface SimulatorState {
  readonly grid: Grid;
  readonly generation: number;
  readonly speedMs: number;
  readonly isRunning: boolean;
}

function assertPositiveSpeed(speedMs: number): void {
  if (!Number.isFinite(speedMs) || speedMs <= 0) {
    throw new RangeError(`simulator: speedMs must be a positive number (got ${speedMs})`);
  }
}

export function createSimulator(initialGrid: Grid, speedMs: number): SimulatorState {
  assertPositiveSpeed(speedMs);
  return {
    grid: cloneGrid(initialGrid),
    generation: 0,
    speedMs,
    isRunning: false,
  };
}

export function tick(state: SimulatorState): SimulatorState {
  return {
    ...state,
    grid: step(state.grid),
    generation: state.generation + 1,
  };
}

export function setSpeed(state: SimulatorState, speedMs: number): SimulatorState {
  assertPositiveSpeed(speedMs);
  return { ...state, speedMs };
}

export function setRunning(state: SimulatorState, isRunning: boolean): SimulatorState {
  return { ...state, isRunning };
}

export function reset(state: SimulatorState, initialGrid: Grid): SimulatorState {
  return {
    ...state,
    grid: cloneGrid(initialGrid),
    generation: 0,
    isRunning: false,
  };
}
