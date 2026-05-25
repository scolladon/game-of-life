export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center gap-4 p-8 bg-zinc-50 dark:bg-black">
      <h1 className="text-5xl font-bold text-zinc-900 dark:text-zinc-50">
        Game of Life
      </h1>
      <h2 className="text-2xl font-medium text-zinc-700 dark:text-zinc-300">
        Le jeu de la vie de Conway
      </h2>
      <p className="max-w-md text-center text-lg text-zinc-600 dark:text-zinc-400">
        Un automate cellulaire imaginé par John Conway en 1970 : sur une grille,
        chaque cellule vit ou meurt selon ses voisines, et de patterns simples
        émergent des structures complexes.
      </p>
    </main>
  );
}
