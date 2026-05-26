import type { Grid } from '@/core/grid';

interface BoardProps {
  readonly grid: Grid;
}

export function Board({ grid }: BoardProps) {
  return (
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
  );
}
