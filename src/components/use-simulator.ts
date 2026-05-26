'use client';

import { useCallback, useEffect, useState } from 'react';
import type { Grid } from '@/core/grid';
import { getPatternLibraryEntry } from '@/core/pattern-library';
import { CONWAY, getRule } from '@/core/rules';
import {
  createSimulator,
  reset as resetSimulator,
  type SimulatorState,
  setRule,
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
  readonly onRuleChange: (name: string) => void;
  readonly onSave: () => Promise<void>;
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
    createSimulator(initialGrid, initialSpeedMs, CONWAY),
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

  const onRuleChange = useCallback(
    (name: string) => {
      const rule = getRule(name);
      setState((current) => {
        const reset = resetSimulator(current, gridFor(pattern));
        return setRule(reset, rule);
      });
    },
    [pattern],
  );

  const onSave = useCallback(async () => {
    await fetch('/api/state', {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({
        patternName: pattern,
        generation: state.generation,
        ruleName: state.rule.name,
        grid: state.grid,
      }),
    });
  }, [pattern, state.generation, state.rule, state.grid]);

  return {
    state,
    pattern,
    handlers: {
      onPlay,
      onPause,
      onStep,
      onReset,
      onSpeedChange,
      onPatternChange,
      onRuleChange,
      onSave,
    },
  };
}
