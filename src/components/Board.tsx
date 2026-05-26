'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import type { Grid } from '@/core/grid';
import { getPattern, type PatternName } from '@/core/patterns';
import {
  createSimulator,
  reset as resetSimulator,
  type SimulatorState,
  setRunning,
  setSpeed,
  tick,
} from '@/core/simulator';
import { GenerationCounter } from './GenerationCounter';
import { PatternSelector } from './PatternSelector';
import { SimulatorControls } from './SimulatorControls';

interface BoardProps {
  readonly initialGrid: Grid;
  readonly initialPattern?: PatternName;
  readonly initialSpeedMs?: number;
}

const CELL_SIZE = 24;
const DEFAULT_SPEED_MS = 200;
const ALIVE_COLOR = '#000';
const DEAD_COLOR = '#fff';
const GRID_LINE_COLOR = '#e4e4e7';

function drawGrid(canvas: HTMLCanvasElement, grid: Grid): void {
  const context = canvas.getContext('2d');
  if (!context) return;
  const rows = grid.length;
  const cols = grid[0]?.length ?? 0;
  canvas.width = cols * CELL_SIZE;
  canvas.height = rows * CELL_SIZE;
  context.fillStyle = DEAD_COLOR;
  context.fillRect(0, 0, canvas.width, canvas.height);
  context.fillStyle = ALIVE_COLOR;
  for (let y = 0; y < rows; y += 1) {
    const row = grid[y];
    if (!row) continue;
    for (let x = 0; x < cols; x += 1) {
      if (row[x]) {
        context.fillRect(x * CELL_SIZE, y * CELL_SIZE, CELL_SIZE, CELL_SIZE);
      }
    }
  }
  context.strokeStyle = GRID_LINE_COLOR;
  context.lineWidth = 1;
  for (let x = 0; x <= cols; x += 1) {
    context.beginPath();
    context.moveTo(x * CELL_SIZE + 0.5, 0);
    context.lineTo(x * CELL_SIZE + 0.5, canvas.height);
    context.stroke();
  }
  for (let y = 0; y <= rows; y += 1) {
    context.beginPath();
    context.moveTo(0, y * CELL_SIZE + 0.5);
    context.lineTo(canvas.width, y * CELL_SIZE + 0.5);
    context.stroke();
  }
}

export function Board({
  initialGrid,
  initialPattern = 'blinker',
  initialSpeedMs = DEFAULT_SPEED_MS,
}: BoardProps) {
  const [pattern, setPattern] = useState<PatternName>(initialPattern);
  const [state, setState] = useState<SimulatorState>(() =>
    createSimulator(initialGrid, initialSpeedMs),
  );
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (canvas) drawGrid(canvas, state.grid);
  }, [state.grid]);

  useEffect(() => {
    if (!state.isRunning) return;
    const handle = setInterval(() => {
      setState((current) => tick(current));
    }, state.speedMs);
    return () => clearInterval(handle);
  }, [state.isRunning, state.speedMs]);

  const handlePlay = useCallback(() => {
    setState((current) => setRunning(current, true));
  }, []);

  const handlePause = useCallback(() => {
    setState((current) => setRunning(current, false));
  }, []);

  const handleStep = useCallback(() => {
    setState((current) => tick(current));
  }, []);

  const handleReset = useCallback(() => {
    setState((current) => resetSimulator(current, getPattern(pattern)));
  }, [pattern]);

  const handleSpeedChange = useCallback((speedMs: number) => {
    setState((current) => setSpeed(current, speedMs));
  }, []);

  const handlePatternChange = useCallback((name: PatternName) => {
    setPattern(name);
    setState((current) => resetSimulator(current, getPattern(name)));
  }, []);

  return (
    <div className="flex flex-col items-center gap-4">
      <div className="flex flex-wrap items-center gap-4">
        <PatternSelector value={pattern} onChange={handlePatternChange} />
        <GenerationCounter count={state.generation} />
      </div>
      <SimulatorControls
        isRunning={state.isRunning}
        speedMs={state.speedMs}
        onPlay={handlePlay}
        onPause={handlePause}
        onStep={handleStep}
        onReset={handleReset}
        onSpeedChange={handleSpeedChange}
      />
      <canvas
        ref={canvasRef}
        role="img"
        aria-label="Game of Life board"
        className="border border-zinc-300 dark:border-zinc-700"
      />
    </div>
  );
}
