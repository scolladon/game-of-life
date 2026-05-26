# Design — Glow Up

## Fichiers touchés

| Fichier | Rôle | Type |
|---|---|---|
| `src/lib/theme/tokens.ts` | Palette nommée `themeTokens.light` / `themeTokens.dark`. | **Nouveau** |
| `src/lib/theme/tokens.test.ts` | Vérifie la forme + la non-vacuité des palettes. | **Nouveau** |
| `src/components/ThemeToggle.tsx` | Bouton client qui toggle `class="dark"` sur `<html>`. | **Nouveau** |
| `src/components/Board.draw.ts` | Lit les couleurs depuis `themeTokens` au lieu de hex hardcodés. | **Modifié** |
| `src/components/Board.tsx` | Monte `<ThemeToggle />` ; passe le thème courant au `drawGrid`. | **Modifié** |
| `src/app/globals.css` | Déclare `.game-board` et un sélecteur `.dark`. | **Modifié** |

## API

```ts
// src/lib/theme/tokens.ts
export interface ThemePalette {
  readonly background: string;
  readonly foreground: string;
  readonly cellAlive: string;
  readonly cellDead: string;
  readonly accent: string;
}
export type ThemeName = 'light' | 'dark';
export const themeTokens: Readonly<Record<ThemeName, ThemePalette>>;
export function getActiveTheme(): ThemeName;  // lit document.documentElement.classList
```

```tsx
// src/components/ThemeToggle.tsx
export function ThemeToggle(): JSX.Element;
```

## Dépendances

- Aucune dépendance npm ajoutée.
- Dépend de `Board.draw.ts` (signature de `drawGrid` est étendue pour accepter une palette optionnelle, défaut = palette light).

## Tests

- `tokens.test.ts` : `themeTokens.light` et `themeTokens.dark` exposent les 5 clés requises, chaînes non vides.
- Pas de test UI pour le toggle (cohérence avec §2.5/§2.6 — pas de React Testing Library dans le projet).

## Notes architecturales

- Le toggle est **idempotent** : si la classe `dark` est déjà présente, on la retire ; sinon on l'ajoute. Pas d'état React (la source de vérité est le DOM).
- `Board.draw.ts` lit le thème *au moment du draw* via `getActiveTheme()` — coût négligeable, et le composant `<Board>` rerendra de toute façon au tick suivant.
- Aucun changement sur `core/` — la feature est strictement périphérique.
