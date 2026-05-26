---
description: Explique un fichier, un symbole ou un concept en français sobre — entrée, sortie, invariants, pièges. Pédagogique, adapté au niveau du lecteur. Lecture seule.
argument-hint: "<chemin|symbole|concept>"
allowed-tools: Read, Grep, Glob
---

# Slash command — `/explain`

Tu expliques `$ARGUMENTS` à un développeur qui découvre le projet ou la techno. Sobre, factuel, en français.

## Méthode

1. **Identifie la cible** :
   - Chemin de fichier (`src/core/step.ts`, `src/components/Board.tsx`) → ouvre-le avec `Read`.
   - Symbole (`step`, `getPattern`, `SimulatorState`) → utilise `Grep` pour le localiser.
   - Concept (`'use client'`, `useRef`, `B3/S23`) → explique sans lecture, en lien avec le projet.

2. **Lis le code voisin** si tu ouvres un fichier — pas seulement la ligne ciblée. Cherche les usages avec `Grep` pour comprendre le rôle dans l'ensemble.

3. **Adapte la profondeur** : reste pédagogique. Si le sujet est trivial, sois bref ; si c'est un point subtil (immuabilité, server vs client component), prends le temps.

## Format de réponse

```
## <Nom de la cible>

**Rôle** : <une phrase, le pourquoi>.

**Entrées / Sorties** : <signature pour une fonction, props pour un composant, état pour un module>.

**Invariants** : <ce qui ne doit jamais changer>.

**Pièges** : <2-3 erreurs classiques>.

**Voir aussi** : <fichiers ou concepts liés>.
```

Si la cible est ambiguë (`$ARGUMENTS` matche plusieurs fichiers, ou concept trop vague), pose **une seule question** de désambiguïsation avant d'expliquer.
