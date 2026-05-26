'use client';

import { useCallback, useEffect, useState } from 'react';
import type { Grid } from '@/core/grid';
import { getPatternLibraryEntry } from '@/core/pattern-library';
import {
  createSimulator,
  reset as resetSimulator,
  type SimulatorState,
  setRunning,
  setSpeed,
  tick,
} from '@/core/simulator';

interface UseSimulatorOptions {
  readonly initialGrid: Grid;
  readonly initialPattern: string;
  readonly initialSpeedMs: number;
}

interface SimulatorHandlers {
  readonly onPlay: () => void;
  readonly onPause: () => void;
  readonly onStep: () => void;
  readonly onReset: () => void;
  readonly onSpeedChange: (speedMs: number) => void;
  readonly onPatternChange: (name: string) => void;
}

interface SimulatorHook {
  readonly state: SimulatorState;
  readonly pattern: string;
  readonly handlers: SimulatorHandlers;
}

function gridFor(name: string): Grid {
  return getPatternLibraryEntry(name).grid;
}

export function useSimulator({
  initialGrid,
  initialPattern,
  initialSpeedMs,
}: UseSimulatorOptions): SimulatorHook {
  const [pattern, setPattern] = useState<string>(initialPattern);
  const [state, setState] = useState<SimulatorState>(() =>
    createSimulator(initialGrid, initialSpeedMs),
  );

  useEffect(() => {
    if (!state.isRunning) return;
    const handle = setInterval(() => {
      setState((current) => tick(current));
    }, state.speedMs);
    return () => clearInterval(handle);
  }, [state.isRunning, state.speedMs]);

  const onPlay = useCallback(() => {
    setState((current) => setRunning(current, true));
  }, []);

  const onPause = useCallback(() => {
    setState((current) => setRunning(current, false));
  }, []);

  const onStep = useCallback(() => {
    setState((current) => tick(current));
  }, []);

  const onReset = useCallback(() => {
    setState((current) => resetSimulator(current, gridFor(pattern)));
  }, [pattern]);

  const onSpeedChange = useCallback((speedMs: number) => {
    setState((current) => setSpeed(current, speedMs));
  }, []);

  const onPatternChange = useCallback((name: string) => {
    setPattern(name);
    setState((current) => resetSimulator(current, gridFor(name)));
  }, []);

  return {
    state,
    pattern,
    handlers: { onPlay, onPause, onStep, onReset, onSpeedChange, onPatternChange },
  };
}
