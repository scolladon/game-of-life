# Game of Life — Repo participant

> Toy project de la **Formation Claude Code (2 jours)**. Tu vas construire un **Jeu de la Vie de Conway** en Next.js, section après section, en appliquant les concepts Claude Code de chaque étape.

## Test-Driven Learning

Au démarrage, **tous les checks sont rouges**. À chaque section, tu appliques un concept Claude Code + tu livres une feature du jeu → tu fais passer le check correspondant au vert.

```
npm run check          # tout est rouge au démarrage
# … tu construis section par section …
npm run check          # tout devient vert au fil de la formation
```

## Prérequis

- **Node.js LTS** (≥ 20)
- **npm**
- **git**
- **Claude Code CLI** installé et connecté à un compte Anthropic

Vérifie ton environnement :

```bash
npm run doctor
```

## Setup

```bash
npm install
npm run dev          # http://localhost:3000
```

## Comprendre la formation

- 📄 [`PRD.md`](./PRD.md) — vision, règles du jeu, état final visé.
- 📋 Slides distribuées par le formateur — déroulé section par section.
- 🧪 `check/check-X.Y.ts` — le check à faire passer pour valider une section.

## Commandes principales

| Commande | Effet |
|----------|-------|
| `npm run dev` | Lance Next.js en mode dev (http://localhost:3000) |
| `npm run build` | Build de production |
| `npm test` | Vitest en mode watch |
| `npm run test:run` | Vitest une fois |
| `npm run test:coverage` | Coverage report |
| `npm run e2e` | Tests Playwright |
| `npm run lint` | Biome lint |
| `npm run format` | Biome format (réécrit les fichiers) |
| `npm run check` | Lance les 15 checks de la formation |
| `npm run check:X.Y` | Lance un check spécifique (ex: `npm run check:2.4`) |
| `npm run doctor` | Vérifie l'environnement local |

## Structure (cible à construire)

```
src/
├── core/        # Moteur Game of Life pur (fonctions pures, tests à 100 %)
├── app/         # Next.js App Router (pages, API routes)
├── components/  # Composants React (UI)
├── lib/         # Utilitaires
├── stores/      # Zustand (à partir de §3.3)
└── workers/     # Web Workers (à partir de §4.2)

check/           # Scripts de validation par section (déjà fournis)

.claude/         # Configuration Claude Code (que tu vas construire)
CLAUDE.md        # Conventions et règles du projet (que tu vas écrire en §2.3)
```

## Convention de progression

Pour chaque section §X.Y :

1. Suis la slide « concept » + la slide « mise en place ».
2. Applique le concept Claude Code dans ce repo.
3. Livre la feature Game of Life associée.
4. `npm run check:X.Y` → ✅.
5. Commit `feat(X.Y): <titre>`.

Bon courage — et amuse-toi.
