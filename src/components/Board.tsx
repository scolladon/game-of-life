'use client';

import { useState } from 'react';
import type { Grid } from '@/core/grid';
import { step } from '@/core/step';

interface BoardProps {
  readonly initialGrid: Grid;
}

export function Board({ initialGrid }: BoardProps) {
  const [grid, setGrid] = useState<Grid>(initialGrid);

  return (
    <div className="flex flex-col items-center gap-4">
      <button
        type="button"
        onClick={() => setGrid((current) => step(current))}
        className="rounded border border-zinc-300 bg-white px-4 py-2 text-sm font-medium text-zinc-900 hover:bg-zinc-100 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-50 dark:hover:bg-zinc-800"
      >
        Next
      </button>
      <div
        role="grid"
        aria-label="Game of Life board"
        className="inline-flex flex-col border border-zinc-300 dark:border-zinc-700"
      >
        {grid.map((row, y) => (
          <div key={y} role="row" className="flex">
            {row.map((alive, x) => (
              <div
                key={x}
                role="gridcell"
                aria-label={alive ? 'alive' : 'dead'}
                className={`h-6 w-6 border border-zinc-200 dark:border-zinc-800 ${
                  alive ? 'bg-black dark:bg-white' : 'bg-white dark:bg-black'
                }`}
              />
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}
