import { Board } from '@/components/Board';
import { PatternsCloud } from '@/components/PatternsCloud';
import { BOARD_SIZE, embedInBoard } from '@/components/use-simulator';
import { getPatternLibraryEntry } from '@/core/pattern-library';

export default function Home() {
  // Plateau de jeu de taille fixe (BOARD_SIZE × BOARD_SIZE) — invariant §2.5.
  // Le pattern initial est centré dans ce plateau (cf. embedInBoard, §3.2),
  // de sorte que le canvas conserve la même taille quel que soit le pattern
  // chargé ensuite via le sélecteur.
  const initialGrid = embedInBoard(
    getPatternLibraryEntry('blinker').grid,
    BOARD_SIZE,
  );

  return (
    <main className="flex min-h-screen flex-col items-center justify-center gap-6 p-8 bg-zinc-50 dark:bg-black">
      <h1 className="text-5xl font-bold text-zinc-900 dark:text-zinc-50">Game of Life</h1>
      <h2 className="text-2xl font-medium text-zinc-700 dark:text-zinc-300">
        Le jeu de la vie de Conway
      </h2>
      <Board initialGrid={initialGrid} initialPattern="blinker" />
      <p className="max-w-md text-center text-sm text-zinc-600 dark:text-zinc-400">
        Choisis un seed dans le menu, puis clique « Next » pour faire avancer d'une génération.
      </p>
      <div className="w-full max-w-md">
        <PatternsCloud />
      </div>
    </main>
  );
}
