'use client';

import { PATTERN_NAMES, type PatternName } from '@/core/patterns';

interface PatternSelectorProps {
  readonly value: PatternName;
  readonly onChange: (name: PatternName) => void;
}

export function PatternSelector({ value, onChange }: PatternSelectorProps) {
  return (
    <label className="flex items-center gap-2 text-sm text-zinc-700 dark:text-zinc-300">
      <span>Pattern</span>
      <select
        value={value}
        onChange={(event) => onChange(event.target.value as PatternName)}
        className="rounded border border-zinc-300 bg-white px-2 py-1 text-sm text-zinc-900 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-50"
      >
        {PATTERN_NAMES.map((name) => (
          <option key={name} value={name}>
            {name}
          </option>
        ))}
      </select>
    </label>
  );
}
