'use client';

import { useMemo } from 'react';
import { getPatternLibrary, type PatternCategory } from '@/core/pattern-library';

interface PatternSelectorProps {
  readonly value: string;
  readonly onChange: (name: string) => void;
}

const CATEGORY_LABELS: Readonly<Record<PatternCategory, string>> = {
  'still-life': 'Still lifes',
  oscillator: 'Oscillators',
  spaceship: 'Spaceships',
  gun: 'Guns',
};

export function PatternSelector({ value, onChange }: PatternSelectorProps) {
  const grouped = useMemo(() => {
    const lib = getPatternLibrary();
    const map = new Map<PatternCategory, { readonly name: string; readonly displayName: string }[]>();
    for (const entry of lib) {
      const bucket = map.get(entry.category) ?? [];
      bucket.push({ name: entry.name, displayName: entry.displayName });
      map.set(entry.category, bucket);
    }
    return map;
  }, []);

  return (
    <label className="flex items-center gap-2 text-sm text-zinc-700 dark:text-zinc-300">
      <span>Pattern</span>
      <select
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className="rounded border border-zinc-300 bg-white px-2 py-1 text-sm text-zinc-900 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-50"
      >
        {Array.from(grouped.entries()).map(([category, entries]) => (
          <optgroup key={category} label={CATEGORY_LABELS[category]}>
            {entries.map((entry) => (
              <option key={entry.name} value={entry.name}>
                {entry.displayName}
              </option>
            ))}
          </optgroup>
        ))}
      </select>
    </label>
  );
}
