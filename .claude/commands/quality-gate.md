---
description: Engineering harness §4.1 — orchestre `quality-types`, `quality-lint`, `quality-coverage` en parallèle, agrège leurs rapports, rend un verdict global PASS / FAIL. Lecture seule, aucune modification de fichier.
argument-hint: ""
allowed-tools: Read, Grep, Glob, Bash
---

# Slash command — `/quality-gate`

Tu es l'**orchestrateur de l'engineering harness §4.1**. Tu **lances en parallèle** trois sous-agents qualité, tu **collectes** leurs rapports, tu **agrèges** en un verdict global. Tu **ne modifies aucun fichier** — c'est une *gate*, pas un *fixer*.

## Mission

Dispatcher en **un seul tour** les trois sous-agents qualité :

1. **`@quality-types`** — `tsc --noEmit` (typage strict).
2. **`@quality-lint`** — `biome check` (lint + format).
3. **`@quality-coverage`** — `vitest run --coverage` (tests + seuils couverture).

> **Important** : invoque les **trois agents en parallèle**, dans un seul message, pour profiter du parallélisme natif Claude Code (cf. §2.8 « équipes d'agents »). Ne les chaîne pas séquentiellement — c'est plus lent et ce n'est pas le pattern enseigné.

## Méthode

1. **Lance les trois agents en parallèle** (un seul tour, trois invocations dans le même message) — chacun rend son rapport autonomement.
2. **Collecte** les trois rapports.
3. **Agrège** selon la règle :
   - **PASS global** si les trois agents rendent PASS.
   - **FAIL global** si au moins un FAIL.
4. **Restitue** un rapport agrégé clair, classé par sévérité.

## Format de rapport agrégé

### En cas de PASS global

```
[PASS] /quality-gate — engineering harness vert.

  [PASS] quality-types     — tsc --noEmit clean.
  [PASS] quality-lint      — biome check clean.
  [PASS] quality-coverage  — N/N tests verts, couverture core/ = 100 %.

Verdict : prêt à commit / merge.
```

### En cas de FAIL global

```
[FAIL] /quality-gate — engineering harness rouge.

  [<PASS|FAIL>] quality-types     — <résumé>
  [<PASS|FAIL>] quality-lint      — <résumé>
  [<PASS|FAIL>] quality-coverage  — <résumé>

=== Détails des blockers ===

<rapport intégral des agents qui ont FAIL, classé par sévérité>

Verdict : <N> gate(s) à corriger avant merge. Ne pas committer en l'état.
```

## Règles strictes

- **Pas de modification de fichier** — `allowed-tools` n'inclut volontairement ni `Edit` ni `Write`. C'est une gate de constat.
- **Pas d'auto-fix** — si un agent suggère un fix (ex : `biome check --write`), tu le **mentionnes** dans le rapport, tu ne l'exécutes pas.
- **Dispatch parallèle obligatoire** — les trois agents s'exécutent dans le même tour. Sinon tu sérialises sans raison.
- **Pas de jugement subjectif** — les agents §4.1 sont **objectifs** (verdict d'outil). Pour le jugement (architecture, lisibilité), utilise les agents §2.8 (`code-reviewer`, `architect-reviewer`) — c'est un autre harness (AI / Architecture).
- **Verdict binaire** — pas de « presque vert », pas de « warning toléré ». Soit les trois passent, soit la gate FAIL.

## Quand l'utiliser

- Avant chaque commit non-trivial.
- En CI sur chaque PR (cf. `.github/workflows/ci.yml` — qui rejoue les mêmes commandes).
- Avant un merge / release.
- **Pas** en boucle sur chaque sauvegarde — c'est le rôle des hooks §2.4 (format auto à chaque édition).
