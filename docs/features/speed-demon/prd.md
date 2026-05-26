# PRD — Speed Demon (perf front)

## Vision

Déplacer le calcul de `step()` du **main thread** vers un **Web Worker**, pour préserver la fluidité de l'UI quand la grille grossit (cf. DESIGN §11 — virtualisation Canvas, viewport). Démontrer la capacité d'une équipe d'agents à livrer une optimisation perf ciblée, sans casser l'API existante.

## Scope

- **Worker dédié** `src/workers/step.worker.ts` qui reçoit `{grid, ruleName}`, calcule `step(grid, rule)`, renvoie la grille suivante.
- **Wrapper isomorphe** `src/lib/worker/step-client.ts` :
  - en environnement client supporté (`typeof Worker !== 'undefined'`), instancie le worker et marshall les messages ;
  - sinon (SSR, tests Node), fallback synchrone vers `step()` direct.
- **API stable** : `useSimulator` (§3.x) continue d'appeler `step` ou `tick` sans changement de signature côté composant. Seul l'intérieur du hook bascule vers le wrapper async-friendly.

## Acceptance criteria

- AC1 — `src/workers/step.worker.ts` existe et exporte (par effet de bord `self.onmessage`) une fonction qui appelle `step` du `core/`.
- AC2 — `src/lib/worker/step-client.ts` exporte `computeNextGrid(grid, rule): Promise<Grid>` ; en SSR/Node, retourne `Promise.resolve(step(grid, rule))`.
- AC3 — `src/components/use-simulator.ts` (ou un nouveau hook qui le wrap) référence `step-client` (ou `step.worker`) — preuve textuelle qu'on est bien passé par la couche worker.
- AC4 — Tests `step-client.test.ts` verts : round-trip d'un blinker à travers le wrapper en mode fallback (Node).
- AC5 — Tests existants `step.test.ts` (Conway + HighLife + toad) inchangés et toujours verts — le `core/` reste pur.

## Non-goals

- Pas de virtualisation Canvas (DESIGN §11, hors §4.2).
- Pas de mesure Lighthouse formelle (DESIGN §11, hors §4.2).
- Pas de transfert structuré (`SharedArrayBuffer`, `Transferable`) — la grille est sérialisée par `postMessage` standard, c'est suffisant à l'échelle pédagogique.
- Pas de pool de workers (un seul suffit pour Game of Life).
