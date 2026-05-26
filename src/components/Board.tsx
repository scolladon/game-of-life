'use client';

import { useEffect, useRef } from 'react';
import type { Grid } from '@/core/grid';
import { drawGrid } from './Board.draw';
import { GenerationCounter } from './GenerationCounter';
import { PatternSelector } from './PatternSelector';
import { RuleSelector } from './RuleSelector';
import { SimulatorControls } from './SimulatorControls';
import { ThemeToggle } from './ThemeToggle';
import { useSimulator } from './use-simulator';

interface BoardProps {
  readonly initialGrid: Grid;
  readonly initialPattern?: string;
  readonly initialSpeedMs?: number;
}

const DEFAULT_SPEED_MS = 200;

export function Board({
  initialGrid,
  initialPattern = 'blinker',
  initialSpeedMs = DEFAULT_SPEED_MS,
}: BoardProps) {
  const { state, pattern, handlers } = useSimulator({
    initialGrid,
    initialPattern,
    initialSpeedMs,
  });
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (canvas) drawGrid(canvas, state.grid);
  }, [state.grid]);

  return (
    <div className="flex flex-col items-center gap-4">
      <div className="flex flex-wrap items-center gap-4">
        <PatternSelector value={pattern} onChange={handlers.onPatternChange} />
        <RuleSelector value={state.rule.name} onChange={handlers.onRuleChange} />
        <GenerationCounter count={state.generation} />
        <ThemeToggle />
      </div>
      <SimulatorControls
        isRunning={state.isRunning}
        speedMs={state.speedMs}
        onPlay={handlers.onPlay}
        onPause={handlers.onPause}
        onStep={handlers.onStep}
        onReset={handlers.onReset}
        onSpeedChange={handlers.onSpeedChange}
        onSave={handlers.onSave}
      />
      <canvas
        ref={canvasRef}
        role="img"
        aria-label="Game of Life board"
        className="game-board border border-zinc-300 dark:border-zinc-700"
      />
    </div>
  );
}
