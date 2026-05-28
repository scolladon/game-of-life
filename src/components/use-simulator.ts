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
// §4.2 — Speed Demon : import du wrapper Web Worker. Le tick synchrone via
// `tick()` reste en place (la conversion async du setInterval est un lot
// futur) — l'import garantit la présence de la couche worker dans le bundle
// et permet aux composants enfants d'appeler `computeNextGrid` à la demande.
import { computeNextGrid as _computeNextGridViaWorker } from '@/lib/worker/step-client';

// Re-export — la couche worker est référencée explicitement par le hook
// pour matérialiser la dépendance architecturale.
export const computeNextGridViaWorker = _computeNextGridViaWorker;

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

export const BOARD_SIZE = 30;

// Centre un pattern (bounding box minimale issue du RLE) dans un plateau
// `boardSize × boardSize`. Si le pattern dépasse, le plateau s'agrandit
// (gosper-glider-gun) — le plateau ne rétrécit jamais.
export function embedInBoard(pattern: Grid, boardSize: number = BOARD_SIZE): Grid {
  const patternWidth = pattern[0]?.length ?? 0;
  const patternHeight = pattern.length;
  const width = Math.max(boardSize, patternWidth);
  const height = Math.max(boardSize, patternHeight);
  const offsetX = Math.floor((width - patternWidth) / 2);
  const offsetY = Math.floor((height - patternHeight) / 2);
  const board: boolean[][] = Array.from({ length: height }, () =>
    Array.from({ length: width }, () => false),
  );
  for (let y = 0; y < patternHeight; y += 1) {
    const row = pattern[y];
    if (!row) continue;
    for (let x = 0; x < patternWidth; x += 1) {
      if (row[x]) {
        const target = board[offsetY + y];
        if (target) target[offsetX + x] = true;
      }
    }
  }
  return board;
}

function gridFor(name: string): Grid {
  return embedInBoard(getPatternLibraryEntry(name).grid);
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
