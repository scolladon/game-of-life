# PRD — Glow Up (UI / visuel)

## Vision

Donner au Game of Life une **identité visuelle propre** et un **mode sombre contrôlé** par l'utilisateur (pas seulement par `prefers-color-scheme`). Démontrer la capacité d'une équipe d'agents à livrer une feature *front-design* en autonomie.

## Scope

- **Palette nommée** centralisée dans `src/lib/theme/tokens.ts` (background, foreground, cellAlive, cellDead, accent). Couleurs distinctes en mode clair / sombre.
- **Toggle clair/sombre** explicite (`<ThemeToggle />`), persistance par `class="dark"` sur `<html>`. Pas d'animation au toggle.
- **Animation cellule** : transition CSS subtile sur la couleur d'une cellule vivante au passage d'un tick (effet "glow" léger, ≤ 200 ms).
- **Identité visuelle** : marquer dans `globals.css` une classe `.game-board` et l'utiliser sur le `<canvas>` pour appliquer le bord/ombre selon le thème.

## Acceptance criteria

- AC1 — `src/lib/theme/tokens.ts` exporte un objet `themeTokens` avec au minimum les clés `light` et `dark`, chacune contenant `background`, `foreground`, `cellAlive`, `cellDead`.
- AC2 — `src/components/ThemeToggle.tsx` est un composant client (`'use client'`) qui :
  - lit/écrit la classe `dark` sur `document.documentElement` ;
  - rend un bouton accessible (`<button>` + `aria-label`).
- AC3 — `<Board>` (ou `<page>`) monte `<ThemeToggle />` quelque part dans son arbre.
- AC4 — `src/app/globals.css` déclare une classe `.game-board` non triviale (≥ 1 propriété).
- AC5 — `Board.draw.ts` lit les couleurs depuis `themeTokens` (suppression des constantes hex hardcodées du module de dessin).

## Non-goals

- Pas de framework de theming (`next-themes`, `theme-ui`…).
- Pas de Context React global — `useState` local suffit.
- Pas de palettes additionnelles (matrix, neon…) — réservées à un lot futur.
- Pas de zoom/pan/minimap (DESIGN §11, hors §4.2).
