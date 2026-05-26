import { Board } from '@/components/Board';
import type { Grid } from '@/core/grid';

const blinkerSeed: Grid = [
  [false, false, false, false, false],
  [false, false, false, false, false],
  [false, true, true, true, false],
  [false, false, false, false, false],
  [false, false, false, false, false],
];

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center gap-6 p-8 bg-zinc-50 dark:bg-black">
      <h1 className="text-5xl font-bold text-zinc-900 dark:text-zinc-50">
        Game of Life
      </h1>
      <h2 className="text-2xl font-medium text-zinc-700 dark:text-zinc-300">
        Le jeu de la vie de Conway
      </h2>
      <Board grid={blinkerSeed} />
      <p className="max-w-md text-center text-sm text-zinc-600 dark:text-zinc-400">
        Seed initial : un blinker (oscillateur de période 2).
      </p>
    </main>
  );
}
