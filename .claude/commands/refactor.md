---
description: Propose et applique un refactor ciblé sur le fichier passé en argument, dans le respect des conventions CLAUDE.md (frontières core/components, immuabilité, pureté). Lance les tests à la fin.
argument-hint: "<chemin>"
allowed-tools: Read, Edit, Grep, Glob, Bash
---

# Slash command — `/refactor`

Tu refactores `$ARGUMENTS` (chemin obligatoire) en t'appuyant sur les conventions du projet.

## Contexte projet — à charger en premier

@CLAUDE.md

## Méthode

1. **Vérifie l'argument** — `$ARGUMENTS` doit être un chemin existant. Si vide ou absent, demande le chemin et arrête-toi.

2. **Vérifie la présence d'un test sibling** — `Grep` un fichier `*.test.ts(x)` à côté ou un fichier de test qui importe le module. Si **aucun test n'existe** pour la cible, **refuse le refactor** et propose d'abord d'écrire un test via l'agent `@test-writer`. Un refactor sans filet est interdit.

3. **Lis la cible et le code voisin** — comprends le rôle du module avant de toucher.

4. **Identifie 2 à 3 refactors ciblés** dans ces axes (ordre de priorité) :
   - **Frontières de couche** — code métier dans `src/components/` à relocaliser dans `src/core/`, dépendance React/Next/DOM dans `src/core/` à extraire.
   - **Immuabilité** — mutation d'arguments ou de state, `.push` / `.sort` sur une référence partagée.
   - **Extraction** — fonction > 50 lignes, fichier > 400 lignes, nesting > 2 niveaux.
   - **Naming** — variables génériques (`data`, `info`, `helper`), incohérences de casing.

5. **Applique les refactors** un par un, via `Edit`. Petits pas. Ne touche pas au comportement observable.

6. **Lance les tests** à la fin :

```
!npm test
```

Si un test casse, **annule le refactor** ou corrige immédiatement. Ne commit jamais avec des tests rouges.

## Format de rapport

Après chaque refactor appliqué :

```
[refactor N] <fichier> — <résumé en une phrase>
  Avant : <pattern problématique>
  Après : <pattern adopté>
  Raison : <règle CLAUDE.md ou principe>
```

Puis la sortie de `npm test`.

Si **rien à refactorer** (cible déjà propre), écris `Cible déjà conforme.` et termine.
