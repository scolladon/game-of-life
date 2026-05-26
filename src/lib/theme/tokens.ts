/**
 * Palette nommée du Game of Life (§4.2 — Glow Up).
 *
 * Deux thèmes : `light` et `dark`. Chaque thème expose les 5 jetons utilisés
 * par l'UI : `background`, `foreground`, `cellAlive`, `cellDead`, `accent`.
 *
 * Source unique de vérité — `Board.draw.ts` et les classes Tailwind dérivées
 * lisent ici plutôt que de re-déclarer des hex literals.
 */

export type ThemeName = 'light' | 'dark';

export interface ThemePalette {
  readonly background: string;
  readonly foreground: string;
  readonly cellAlive: string;
  readonly cellDead: string;
  readonly accent: string;
}

export const themeTokens: Readonly<Record<ThemeName, ThemePalette>> = Object.freeze({
  light: Object.freeze({
    background: '#fafafa',
    foreground: '#18181b',
    cellAlive: '#0a0a0a',
    cellDead: '#ffffff',
    accent: '#6366f1',
  }),
  dark: Object.freeze({
    background: '#09090b',
    foreground: '#fafafa',
    cellAlive: '#22d3ee',
    cellDead: '#0a0a0a',
    accent: '#a78bfa',
  }),
});

const DARK_CLASS = 'dark';

/**
 * Lit le thème actif depuis la classe sur `<html>`.
 * Côté SSR (pas de `document`), retourne `'light'` par défaut.
 */
export function getActiveTheme(): ThemeName {
  if (typeof document === 'undefined') return 'light';
  return document.documentElement.classList.contains(DARK_CLASS) ? 'dark' : 'light';
}

export function getActivePalette(): ThemePalette {
  return themeTokens[getActiveTheme()];
}
