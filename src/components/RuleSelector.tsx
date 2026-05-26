'use client';

import { RULES } from '@/core/rules';

interface RuleSelectorProps {
  readonly value: string;
  readonly onChange: (name: string) => void;
}

export function RuleSelector({ value, onChange }: RuleSelectorProps) {
  return (
    <label className="flex items-center gap-2 text-sm text-zinc-700 dark:text-zinc-300">
      <span>Règle</span>
      <select
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className="rounded border border-zinc-300 bg-white px-2 py-1 text-sm text-zinc-900 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-50"
      >
        {RULES.map((rule) => (
          <option key={rule.name} value={rule.name}>
            {rule.displayName}
          </option>
        ))}
      </select>
    </label>
  );
}
