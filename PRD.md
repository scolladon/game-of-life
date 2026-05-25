# PRD — Game of Life

> Web app implémentant le **Jeu de la Vie de Conway**, construite progressivement avec Claude Code pendant la formation.
>
> **Tu construis ce projet à partir de cet état initial**, section après section, en faisant passer les checks au vert (`npm run check:X.Y`).

## 1. Vision

Une simulation interactive de Conway's Game of Life, jouable dans le navigateur. Au démarrage, ce repo contient seulement la stack technique et les checks. **C'est toi qui construis le projet** en suivant les slides et en appliquant les concepts Claude Code de chaque section.

## 2. Rappel des règles du Jeu de la Vie

Sur une grille 2D où chaque cellule est *vivante* ou *morte* :
1. Une cellule vivante avec **2 ou 3** voisins vivants survit.
2. Une cellule vivante avec **moins de 2** voisins meurt (sous-population).
3. Une cellule vivante avec **plus de 3** voisins meurt (sur-population).
4. Une cellule morte avec **exactement 3** voisins vivants devient vivante (reproduction).

Ces 4 règles produisent une infinité de comportements émergents : oscillateurs, planeurs, vaisseaux, canons, etc.

## 3. Stack technique

Pré-installée dans ce repo :
- **Next.js 16** (App Router) + **TypeScript** strict
- **Tailwind CSS** (style brut)
- **Biome** (lint + format)
- **Vitest** (tests unitaires + intégration)
- **Playwright** (tests E2E)
- **tsx** (runtime TypeScript pour les checks)

## 4. État final visé (livrable du participant)

À la fin de la formation, ce projet contient :
- ✅ **Moteur Game of Life pur** (`src/core/`) : grid, règles Conway + HighLife, générations, parser RLE. **100 % de couverture de tests.**
- ✅ **UI Next.js** : Canvas, contrôles (Play/Pause/Step/Speed/Reset), pattern picker, sélecteur de règles.
- ✅ **Persistance SQLite** (Drizzle ORM) pour les patterns custom.
- ✅ **3 features livrées en parallèle** via équipes d'agents :
  - 🎨 **Glow Up** — animations, thèmes, zoom/pan, minimap.
  - ⚡ **Speed Demon** — Web Worker, virtualisation, code-splitting (Lighthouse ≥ 95).
  - ☁️ **Cloud Patterns** — API REST, partage par URL, rate limiting.
- ✅ **3 harness en place** :
  - **AI** : `.claude/` complet (commands, agents, skills, hooks).
  - **Architecture** : `CLAUDE.md` (conventions hexagonales) + agent `architect-reviewer`.
  - **Engineering** : `/quality-gate` orchestrant 3 sous-agents (types, lint, coverage). CI GitHub Actions.

## 5. Architecture (à construire)

```
src/
├── core/        # Moteur pur, ZÉRO dépendance React/Next/DOM
├── app/         # Next.js App Router
├── components/  # Composants React (UI pure)
├── lib/         # Utilitaires partagés
├── stores/      # Zustand stores (à partir de §3.3)
└── workers/     # Web Workers (à partir de §4.2)
```

**Règle clé** : `src/core/` est testable sans navigateur, sans React, sans Next. Fonctions pures uniquement.

## 6. Comment progresser

1. Lance `npm install` puis `npm run dev` — l'app tourne sur http://localhost:3000.
2. Lance `npm run check` — au démarrage, **15 checks sont rouges**.
3. Suis les slides distribuées par le formateur, section après section.
4. À chaque section, applique le concept Claude Code et livre la feature → fais passer le check correspondant au vert.

À la fin : tous les checks ✅ + un Game of Life polished que tu emportes.

## 7. Hors-scope

- Pas d'authentification réelle (token anonyme local pour partage en §4.2).
- Pas de multi-joueur temps réel (WebSocket).
- Pas de déploiement (Vercel, Docker).
- Pas d'i18n.
- Pas de variantes au-delà de Conway + HighLife.
