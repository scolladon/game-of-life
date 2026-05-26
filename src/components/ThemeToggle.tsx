'use client';

/**
 * Toggle clair/sombre (§4.2 — Glow Up).
 *
 * Source de vérité : la classe `dark` sur `<html>`. Pas d'état React (on
 * synchronise via un `useState` initialisé au premier mount pour éviter le
 * mismatch SSR/CSR sur le label).
 *
 * Pas de framework de theming, pas de Context global — le composant se
 * borne à manipuler le DOM et exposer un label cohérent.
 */

import { useEffect, useState } from 'react';
import { getActiveTheme, type ThemeName } from '@/lib/theme/tokens';

const DARK_CLASS = 'dark';
const BUTTON_CLASS =
  'rounded border border-zinc-300 bg-white px-3 py-1.5 text-sm font-medium text-zinc-900 hover:bg-zinc-100 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-50 dark:hover:bg-zinc-800';

export function ThemeToggle() {
  const [theme, setTheme] = useState<ThemeName>('light');

  useEffect(() => {
    setTheme(getActiveTheme());
  }, []);

  function toggle(): void {
    const root = document.documentElement;
    const next: ThemeName = root.classList.contains(DARK_CLASS) ? 'light' : 'dark';
    root.classList.toggle(DARK_CLASS, next === 'dark');
    setTheme(next);
  }

  const label = theme === 'dark' ? 'Mode clair' : 'Mode sombre';

  return (
    <button
      type="button"
      className={BUTTON_CLASS}
      onClick={toggle}
      aria-label={`Basculer vers le ${label.toLowerCase()}`}
    >
      {label}
    </button>
  );
}
