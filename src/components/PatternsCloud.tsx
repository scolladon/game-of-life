/**
 * Liste des patterns partagés (§4.2 — Cloud Patterns).
 *
 * Server component — lit le repository en direct (pas de round-trip HTTP).
 * UI minimaliste : nom, auteur opaque (8 premiers chars du token), date.
 */

import { listPatterns, type PersistedPattern } from '@/lib/persistence/patterns-repository';

const SHORT_TOKEN_CHARS = 8;

function formatAuthor(token: string): string {
  if (token.length <= SHORT_TOKEN_CHARS) return token;
  return `${token.slice(0, SHORT_TOKEN_CHARS)}…`;
}

function formatDate(date: Date): string {
  return date.toISOString().slice(0, 10);
}

interface PatternsCloudProps {
  readonly limit?: number;
}

export async function PatternsCloud({ limit = 10 }: PatternsCloudProps) {
  let items: readonly PersistedPattern[] = [];
  try {
    items = await listPatterns(limit);
  } catch {
    // En SSR sans DB initialisée (premier render avant tout POST), on rend
    // simplement la coquille vide. La route POST initialise la table à la
    // première écriture.
    items = [];
  }

  if (items.length === 0) {
    return (
      <section className="rounded border border-zinc-200 p-4 text-sm text-zinc-600 dark:border-zinc-800 dark:text-zinc-400">
        <h3 className="mb-2 text-base font-semibold text-zinc-900 dark:text-zinc-50">
          Patterns partagés
        </h3>
        <p>Aucun pattern partagé pour l'instant.</p>
      </section>
    );
  }

  return (
    <section className="rounded border border-zinc-200 p-4 dark:border-zinc-800">
      <h3 className="mb-2 text-base font-semibold text-zinc-900 dark:text-zinc-50">
        Patterns partagés
      </h3>
      <ul className="flex flex-col gap-1 text-sm text-zinc-700 dark:text-zinc-300">
        {items.map((pattern) => (
          <li key={pattern.id} className="flex items-center justify-between gap-4">
            <span className="font-medium">{pattern.name}</span>
            <span className="font-mono text-xs text-zinc-500 dark:text-zinc-400">
              {formatAuthor(pattern.authorToken)} · {formatDate(pattern.createdAt)}
            </span>
          </li>
        ))}
      </ul>
    </section>
  );
}
