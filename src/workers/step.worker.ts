/**
 * Web Worker — calcule `step(grid, rule)` hors main thread (§4.2 — Speed Demon).
 *
 * Protocole minimal :
 *   - in  : { requestId, grid, ruleName }
 *   - out : { requestId, grid }
 *
 * Le worker importe `step` du `core/` (zéro duplication de logique). Il
 * référence également `core/rules` pour résoudre le nom de règle en `Rule`.
 *
 * Pattern Next/Webpack supporté nativement :
 *   new Worker(new URL('@/workers/step.worker.ts', import.meta.url), { type: 'module' })
 */

/// <reference lib="webworker" />

import type { Grid } from '@/core/grid';
import { getRule } from '@/core/rules';
import { step } from '@/core/step';

export interface StepWorkerRequest {
  readonly requestId: number;
  readonly grid: Grid;
  readonly ruleName: string;
}

export interface StepWorkerResponse {
  readonly requestId: number;
  readonly grid: Grid;
}

// Cast déclaratif vers DedicatedWorkerGlobalScope — évite l'union DOM/Window
// quand le module est compilé en mode browser-lib.
const worker = self as unknown as DedicatedWorkerGlobalScope;

worker.onmessage = (event: MessageEvent<StepWorkerRequest>) => {
  const { requestId, grid, ruleName } = event.data;
  const rule = getRule(ruleName);
  const next = step(grid, rule);
  const response: StepWorkerResponse = { requestId, grid: next };
  worker.postMessage(response);
};
