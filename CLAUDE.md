@AGENTS.md

## Modèles et niveaux d'effort

**Défaut projet : Sonnet 4.6.** Équilibre capacité/coût optimal pour le code
applicatif de ce projet (composants React, hooks, routes API Next.js, tests
Vitest).

| Type de tâche                                  | Modèle      | Pourquoi                                          |
|------------------------------------------------|-------------|---------------------------------------------------|
| Composant React, hook, route API, test Vitest  | Sonnet 4.6  | Meilleur coding model, 200k de contexte           |
| Refacto cross-fichiers, archi, debug épineux   | Opus 4.7    | Raisonnement profond, 1M de contexte              |
| Génération de tests, scaffolding, edits courts | Haiku 4.5   | ~3× moins cher que Sonnet, latence faible         |

### Changer de modèle ad-hoc

- `/model <name>` pendant la session (effet immédiat).
- `claude --model <name>` au lancement.
- `~/.claude/settings.json` pour fixer un défaut utilisateur global.

### Extended thinking (niveau d'effort)

Actif par défaut. Toggle via **Opt+T** (macOS) / **Alt+T** (Windows/Linux).
Plafonner sur tâches simples : `MAX_THINKING_TOKENS=10000`.

## Stack

- **Next.js 16.2** — App Router, server components par défaut.
- **React 19.2** — runtime UI.
- **TypeScript 5** strict — `noUncheckedIndexedAccess` actif (cf. `tsconfig.json`).
- **Tailwind v4** — styling utility-first.
- **Vitest 4** — tests unitaires co-localisés.
- **Biome 2** — formatter + linter (remplace ESLint + Prettier).
- **Playwright 1.60** — tests E2E.
- **tsx 4** — runner TypeScript pour les scripts `check/`.

## Architecture

Le code applicatif vit dans `src/`, organisé en 4 couches :

- **`src/core/`** — logique pure du Game of Life (grille, step, règles).
  **Règle dure** : zéro dépendance Next/React/DOM/fetch/localStorage. Fonctions
  pures uniquement, données immutables. On ne mute jamais les arguments, on
  retourne toujours de nouvelles structures.
- **`src/app/`** — routes Next.js (App Router). Pages, layouts, API routes.
- **`src/components/`** — composants React de présentation. Pas de logique
  métier (elle vit dans `core/` ou dans des hooks).
- **`src/lib/`** — adapters et utilitaires partagés (parsers, helpers I/O,
  repositories vers la persistance).

`core/` reste pur pour être testable isolément, portable vers un Web Worker
plus tard, et indépendant du framework — un changement de Next ne casse pas
les règles du jeu.

## Conventions

- **Naming** : `kebab-case.ts` pour les fichiers, `PascalCase` pour les
  composants React, `camelCase` pour fonctions et variables,
  `UPPER_SNAKE_CASE` pour les constantes.
- **Taille** : fichiers ≤ 400 lignes (extraire au-delà). Fonctions ≤ 50 lignes.
- **Tests** : co-localisés (`grid.ts` → `grid.test.ts` à côté). E2E à part dans
  `tests/e2e/`.
- **Types** : pas de `any`. Préférer `unknown` + type guard. Types stricts en
  exports publics. `readonly` partout où c'est applicable côté `core/`.
- **Immutabilité** : pas de mutation d'arguments. Retourner de nouvelles
  structures (spread, `map`, `filter`).
- **Commits** : conventionnels (`feat:`, `fix:`, `refactor:`, `test:`, `docs:`,
  `chore:`).
