import { cloneGrid, type Grid } from './grid';
import { CONWAY, type Rule } from './rules';
import { step } from './step';

export interface SimulatorState {
  readonly grid: Grid;
  readonly generation: number;
  readonly speedMs: number;
  readonly isRunning: boolean;
  readonly rule: Rule;
}

function assertPositiveSpeed(speedMs: number): void {
  if (!Number.isFinite(speedMs) || speedMs <= 0) {
    throw new RangeError(`simulator: speedMs must be a positive number (got ${speedMs})`);
  }
}

export function createSimulator(
  initialGrid: Grid,
  speedMs: number,
  rule: Rule = CONWAY,
): SimulatorState {
  assertPositiveSpeed(speedMs);
  return {
    grid: cloneGrid(initialGrid),
    generation: 0,
    speedMs,
    isRunning: false,
    rule,
  };
}

export function tick(state: SimulatorState): SimulatorState {
  return {
    ...state,
    grid: step(state.grid, state.rule),
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

export function setRule(state: SimulatorState, rule: Rule): SimulatorState {
  return { ...state, rule };
}

export function reset(state: SimulatorState, initialGrid: Grid): SimulatorState {
  return {
    ...state,
    grid: cloneGrid(initialGrid),
    generation: 0,
    isRunning: false,
  };
}
