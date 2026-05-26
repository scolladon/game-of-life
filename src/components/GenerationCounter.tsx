interface GenerationCounterProps {
  readonly count: number;
}

export function GenerationCounter({ count }: GenerationCounterProps) {
  return (
    <span className="font-mono text-sm text-zinc-700 dark:text-zinc-300">Génération N°{count}</span>
  );
}
