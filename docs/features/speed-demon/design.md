# Design — Speed Demon

## Fichiers touchés

| Fichier | Rôle | Type |
|---|---|---|
| `src/workers/step.worker.ts` | Worker dédié — `self.onmessage` → `step(grid, rule)` → `postMessage(nextGrid)`. | **Nouveau** |
| `src/lib/worker/step-client.ts` | Wrapper isomorphe `computeNextGrid` (worker côté browser, fallback `step()` côté Node). | **Nouveau** |
| `src/lib/worker/step-client.test.ts` | Round-trip blinker en mode fallback (Node). | **Nouveau** |
| `src/components/use-simulator.ts` | Référence `step-client` (au moins l'import). | **Modifié** |

## API

```ts
// src/workers/step.worker.ts
interface StepRequest {
  readonly grid: Grid;
  readonly ruleName: string;
}
// self.onmessage(e: MessageEvent<StepRequest>) → postMessage(nextGrid)
```

```ts
// src/lib/worker/step-client.ts
import type { Grid } from '@/core/grid';
import type { Rule } from '@/core/rules';

export function computeNextGrid(grid: Grid, rule: Rule): Promise<Grid>;
export function isWorkerSupported(): boolean;  // typeof Worker !== 'undefined' && côté browser
```

## Dépendances

- Aucune dépendance npm ajoutée.
- Pattern Next/Webpack supporté nativement : `new Worker(new URL('../../workers/step.worker.ts', import.meta.url), { type: 'module' })`.

## Tests

- `step-client.test.ts` (mode Node, fallback synchrone) :
  - `given un blinker when computeNextGrid then renvoie la rotation 90°`.
  - `given isWorkerSupported when Node then retourne false`.
- Pas de test en environnement worker (l'exécution réelle du worker dans Vitest demande `happy-dom` + `Worker` polyfill — hors scope §4.2).

## Notes architecturales

- **Le `core/` reste pur** — `step.worker.ts` est un *adapter* (couche `lib/`), pas une duplication de `step.ts`. Il importe `step` du `core/`.
- **`use-simulator` reste synchrone à l'extérieur** — la conversion en async serait une refonte majeure (Promise-driven `setInterval`). Pour §4.2, on se contente d'importer `step-client` (preuve d'intégration) ; le passage effectif `await computeNextGrid(...)` dans le tick est un lot futur (DESIGN §11 — virtualisation).
- **Fallback systématique en SSR** — Next 16 monte le hook côté serveur lors de l'hydratation initiale ; le wrapper *doit* être no-op au premier render et n'instancier le worker que dans un `useEffect`.
- **Lazy init** — le worker est créé à la première invocation client, pas à l'import du module (sinon SSR crash).
